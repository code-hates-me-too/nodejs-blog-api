const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../data/db");

router.get("/blogs/category/:categoryid", async (req, res) => {
    const categoryid = req.params.categoryid;
    try {
        const [blogs] = await db.execute(
            "SELECT * FROM blog WHERE categoryid=?", 
            [categoryid]
        );

        const [categories] = await db.execute(
            "SELECT * FROM category"
        );

        const  [title] = await db.execute("SELECT categoryname FROM category WHERE categoryid=?", [categoryid]); 
        res.render("users/blogs", {
            title: title[0].categoryname,
            blogs,
            categories,
            selectedCategory: categoryid
        });
    } catch (err) {
        console.log(err);
    }
});


router.get("/blogs/:blogid", async (req, res) => {
    const blogid = req.params.blogid;
    
    try {
        const [blog, ] = await db.execute("SELECT * FROM blog WHERE blogid=?", [blogid]);
        if(blog[0]) {
            return res.render("users/blog-details", {
                title: blog[0].baslik,
                blog: blog[0],
                selectedCategory: null
            });
        } 
        res.redirect("/blogs");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs", async (req, res) => {
    try {
        const [blogs] = await db.execute(
            "SELECT * FROM blog WHERE onay=1"
        );

        const [categories] = await db.execute(
            "SELECT * FROM category"
        );

        res.render("users/blogs", {
            title: "Tüm Bloglar",
            blogs,
            categories,
            selectedCategory: null
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/", async (req, res) => {
    try{
        const [blogs] = await db.execute(
            "SELECT * FROM blog WHERE onay=1 AND anasayfa=1"
        );

        const [categories] = await db.execute(
            "SELECT * FROM category"
        );

        res.render("users/index", {
            title: "Anasayfa",
            blogs,
            categories,
            selectedCategory: null
        });

    } catch (err) {
        console.log(err);
    }
});

module.exports = router;