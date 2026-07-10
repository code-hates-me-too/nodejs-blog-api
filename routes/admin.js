const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../data/db");

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
        res.redirect("/");
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
        res.redirect("/admin/blogs");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs", async (req, res) => {
    try {
        const [blogs, ] = await db.execute("SELECT * FROM blog");
        
        res.render("admins/blog-list", {
            title: "Edit Blogs",
            blogs: blogs
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;