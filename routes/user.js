const express = require("express");
const path = require("path");
const router = express.Router();
const Blog = require("../models/blog");
const Category = require("../models/category");
const { Op } = require("sequelize");

router.get("/blogs/category/:categoryid", async (req, res) => {
    const categoryid = Number(req.params.categoryid);
    try {
        const blogs = await Blog.findAll({
            where: {
                categoryid: categoryid,
                onay: true
            }
        });

        const categories = await Category.findAll();

        const title = await Category.findByPk(categoryid);

        res.render("users/blogs", {
            title: title.categoryname,
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
        const blog = await Blog.findByPk(blogid);
        //BURAYI KONTROL ET
        if(blog) {
            if(blog.onay == true) {
                return res.render("users/blog-details", {
                    title: blog.baslik,
                    blog: blog,
                });
            } 
        }
        res.redirect("/blogs");
    } catch (err) {
        console.log(err);
    }
});

router.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: {
                onay: {
                    [Op.eq]: true
                }
            }
        });

        const categories = await Category.findAll();

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
        const blogs = await Blog.findAll({
            where: {
                [Op.and]: [
                    { anasayfa: true }, 
                    { onay: true }, 
                ]
            }
        });

        const categories = await Category.findAll();

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