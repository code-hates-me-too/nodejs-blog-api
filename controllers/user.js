const Blog = require("../models/blog");
const Category = require("../models/category");
const { Op, where } = require("sequelize");

exports.blogs_by_category = async (req, res) => {
    const slug = req.params.slug;
    try {
        const blogs = await Blog.findAll({
            where: {
                onay: true
            },
            include: {
                model: Category,
                where: { url: slug }
            }
        });

        const categories = await Category.findAll();

        const title = await Category.findOne({
            where: {
                url: slug  
            }
        });

        res.render("users/blogs", {
            title: title.categoryname,
            blogs,
            categories,
            selectedCategory: slug
        });
    } catch (err) {
        console.log(err);
    }
};

exports.blog_details = async (req, res) => {
    const slug = req.params.slug;
    
    try {
        const blog = await Blog.findOne({
            where: {
                url: slug
            }
        });

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
};

exports.blogs = async (req, res) => {
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
};

exports.mainpage = async (req, res) => {
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
};