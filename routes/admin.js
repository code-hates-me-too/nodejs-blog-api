const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../helpers/image-upload");
const fs = require("fs");
const Blog = require("../models/blog");
const Category = require("../models/category");

router.get("/categories/delete/:categoryid", async (req, res) => {
    const delcategoryid = req.params.categoryid;
    try {
        const category = await Category.findByPk(delcategoryid);
        res.render("admins/category-delete", {
            title: "Delete Category",
            category: category
        });
    } catch (err) {
        console.log(err);
    }
}); //+

router.post("/categories/delete/:categoryid", async (req, res) => {
    const delcategoryid = req.body.categoryid;
    try {
        await Category.destroy({
            where: {
                categoryid: delcategoryid
            }
        });
        res.redirect("/admin/categories?action=delete");
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/categories/create", async (req, res) => {
    try {
        res.render("admins/category-create", {
            title: "Create Category",
        });

    } catch (err) {
        console.log(err);
    }
}); //+

router.post("/categories/create", async (req, res) => {
    const baslik = req.body.baslik;

    try {
        await Category.create({ categoryname: baslik});
        res.redirect("/admin/categories?action=create");
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/categories/:categoryid", async (req, res) => {
    const pickedcategoryid = req.params.categoryid;

    try {
        const category = await Category.findByPk(pickedcategoryid);
        
        if(category) {
            return res.render("admins/category-edit", {
                title: " Kategori Edit",
                category: category
            });
        }

        res.redirect("/admin/categories");

    } catch (err) {
        console.log(err);
    }
}); //+

router.post("/categories/:categoryid", async (req, res) => {
    const categoryid = req.body.categoryid;
    const baslik = req.body.baslik;

    try {
        const pickedCategory = await Category.findByPk(categoryid);
        if(pickedCategory) {
            pickedCategory.categoryname = baslik;

            await pickedCategory.save()
            res.redirect("/admin/categories?action=edit");
        }
        res.redirect("/admin/categories");
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.findAll();
        
        res.render("admins/category-list", {
            title: "Edit Categories",
            categories: categories,
            action: req.query.action
        });
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/blog/delete/:blogid", async (req, res) => {
    const delblogid = req.params.blogid;
    try {
        const blog = await Blog.findByPk(delblogid);
        if(blog) {
            return res.render("admins/blog-delete", {
                title: "Delete Blog",
                blog: blog
            });
        }
        return res.redirect("/admin/blogs");
    } catch (err) {
        console.log(err);
    }
}); //+

router.post("/blog/delete/:blogid", async (req, res) => {
    const delblogid = req.body.blogid;
    try {
        const blog = await Blog.findByPk(delblogid);
        if(blog) {
            await blog.destroy();
            return res.redirect("/admin/blogs?action=delete");
        }
        res.redirect("/admin/blogs");
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/blogs/create", async (req, res) => {
    try {
        const categories = await Category.findAll();

        res.render("admins/blog-create", {
            title: "Create Blog",
            categories: categories
        });

    } catch (err) {
        console.log(err);
    }
}); //+

router.post("/blogs/create", imageUpload.upload.single("resim"), async (req, res) => {
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const resim = req.file.filename;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;

    try {
        await Blog.create({
            baslik: baslik,
            altbaslik: altbaslik,
            aciklama: aciklama,
            resim: resim,
            anasayfa: anasayfa,
            onay: onay,
            categoryid: kategori
        });
        res.redirect("/admin/blogs?action=create");
    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/blogs/:blogid", async (req, res) => {
    const pickedblogid = req.params.blogid;

    try {
        const blog = await Blog.findByPk(pickedblogid);
        const categories = await Category.findAll();
        
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
}); //+

router.post("/blogs/:blogid", imageUpload.upload.single("resim"), async (req, res) => {
    const blogid = req.body.blogid;
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;

    const resim = req.file ? req.file.filename : req.body.eskiResim;
    
    if(req.file) {
        fs.unlink("./public/images/" + req.body.eskiResim, err => {
            if (err) {
                console.log(err);
            }
        });
    } 

    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;


    try {
        const blog = await Blog.findByPk(blogid);
        if(blog) {
            blog.baslik = baslik;
            blog.altbaslik = altbaslik;
            blog.aciklama = aciklama;
            blog.resim = resim;
            blog.anasayfa = anasayfa;
            blog.onay = onay;
            blog.categoryid = kategori;
            await blog.save();
            return res.redirect("/admin/blogs?action=edit");
        }
        res.redirect("/admin/blogs");

    } catch (err) {
        console.log(err);
    }
}); //+

router.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.findAll();

        res.render("admins/blog-list", {
            title: "Edit Blogs",
            blogs: blogs,
            action: req.query.action
        });
    } catch (err) {
        console.log(err);
    }
}); //+

module.exports = router;