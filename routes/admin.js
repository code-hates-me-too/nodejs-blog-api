const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../data/db");

router.get("/categories/delete/:categoryid", async (req, res) => {
    const delcategoryid = req.params.categoryid;
    try {
        const [category, ] = await db.execute("SELECT * FROM category WHERE categoryid=?", [delcategoryid]);
        res.render("admins/category-delete", {
            title: "Delete Category",
            category: category[0]
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/categories/delete/:categoryid", async (req, res) => {
    const delcategoryid = req.body.categoryid;
    try {
        await db.execute("DELETE FROM category WHERE categoryid=?", [delcategoryid]);
        res.redirect("/admin/categories?action=delete");
    } catch (err) {
        console.log(err);
    }
});

router.get("/categories/create", async (req, res) => {
    try {
        const [categories, ] = await db.execute("SELECT * FROM category") 
        
        res.render("admins/category-create", {
            title: "Create Category",
            categories: categories
        });

    } catch (err) {
        console.write(err);
    }
});

router.post("/categories/create", async (req, res) => {
    const baslik = req.body.baslik;

    try {
        await db.execute(`INSERT INTO category(categoryname)
        VALUES (?)`, [baslik]);
        res.redirect("/admin/categories?action=create");
    } catch (err) {
        console.log(err);
    }
});

router.get("/categories/:categoryid", async (req, res) => {
    const pickedcategoryid = req.params.categoryid;

    try {
        const [category, ] = await db.execute("SELECT * FROM category WHERE categoryid=?", [pickedcategoryid]);
        
        if(category) {
            return res.render("admins/category-edit", {
                title: " Kategori Edit",
                category: category[0]
            });
        }

        res.redirect("/admin/categories");

    } catch (err) {
        console.log(err);
    }
});

router.post("/categories/:categoryid", async (req, res) => {
    const categoryid = req.body.categoryid;
    const baslik = req.body.baslik;

    try {
        await db.execute("UPDATE category SET categoryname=? WHERE categoryid=?",
        [baslik, categoryid]);
        res.redirect("/admin/categories?action=edit");
    } catch (err) {
        console.log(err);
    }
});

router.get("/categories", async (req, res) => {
    try {
        const [categories, ] = await db.execute("SELECT * FROM category");
        
        res.render("admins/category-list", {
            title: "Edit Categories",
            categories: categories,
            action: req.query.action
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/blog/delete/:blogid", async (req, res) => {
    const delblogid = req.params.blogid;
    try {
        const [blog, ] = await db.execute("SELECT * FROM blog WHERE blogid=?", [delblogid]);
        res.render("admins/blog-delete", {
            title: "Delete Blog",
            blog: blog[0]
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/blog/delete/:blogid", async (req, res) => {
    const delblogid = req.body.blogid;
    try {
        await db.execute("DELETE FROM blog WHERE blogid=?", [delblogid]);
        res.redirect("/admin/blogs?action=delete");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs/create", async (req, res) => {
    try {
        const [categories, ] = await db.execute("SELECT * FROM category") 
        
        res.render("admins/blog-create", {
            title: "Create Blog",
            categories: categories
        });

    } catch (err) {
        console.write(err);
    }
});

router.post("/blogs/create", async (req, res) => {
    const baslik = req.body.baslik;
    const aciklama = req.body.aciklama;
    const resim = req.body.resim;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;

    try {
        await db.execute(`INSERT INTO blog(baslik, aciklama, resim, anasayfa, onay, categoryid)
        VALUES (?,?,?,?,?,?)`, [baslik, aciklama, resim, anasayfa, onay, kategori]);
        res.redirect("/admin/blogs?action=create");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs/:blogid", async (req, res) => {
    const pickedblogid = req.params.blogid;

    try {
        const [blogs, ] = await db.execute("SELECT * FROM blog WHERE blogid=?", [pickedblogid]);
        const [categories, ] = await db.execute("SELECT * FROM category");
        const blog = blogs[0];
        
        if(blog) {
            return res.render("admins/blog-edit", {
                title: blog.baslik + "Edit",
                blog: blog,
                categories: categories
            });
        }

        res.redirect("/admin/blogs");

    } catch (err) {
        console.log(err);
    }
});

router.post("/blogs/:blogid", async (req, res) => {
    const blogid = req.body.blogid;
    const baslik = req.body.baslik;
    const aciklama = req.body.aciklama;
    const resim = req.body.resim;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;

    try {
        await db.execute("UPDATE blog SET baslik=?, aciklama=?, resim=?, anasayfa=?, onay=?, categoryid=? WHERE blogid=?",
        [baslik, aciklama, resim, anasayfa, onay, kategori, blogid]);
        res.redirect("/admin/blogs?action=edit");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs", async (req, res) => {
    try {
        const [blogs, ] = await db.execute("SELECT * FROM blog");
        
        res.render("admins/blog-list", {
            title: "Edit Blogs",
            blogs: blogs,
            action: req.query.action
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;