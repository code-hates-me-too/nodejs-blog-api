const Blog = require("../models/blog");
const Category = require("../models/category");
const { Op, where } = require("sequelize");

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
    const size = 3;
    const { page = 0 } = req.query;
    const slug = req.params.slug;
    try {
        const { rows, count } = await Blog.findAndCountAll({
            where: {
                onay: {
                    [Op.eq]: true
                }
            },
            include: slug ? { model: Category, where: { url: slug }} : null,
            limit: size,
            offset: page * size
        });

        const categories = await Category.findAll();

        res.render("users/blogs", {
            title: "Tüm Bloglar",
            blogs: rows,
            categories,
            totalItems: count,
            totalPages: Math.ceil(count / size),
            currentPage: page,
            selectedCategory: null
        });
    } catch (err) {
        console.log(err);
    }
};

exports.mainpage = async (req, res) => {
    const size = 6;
    const { page = 0 } = req.query;
    try{
        const { rows, count} = await Blog.findAndCountAll({
            where: {
                [Op.and]: [
                    { anasayfa: true }, 
                    { onay: true }, 
                ]
            },
            limit: size,
            offset: page * size
        });

        const categories = await Category.findAll();

        res.render("users/index", {
            title: "Anasayfa",
            blogs: rows,
            categories,
            totalItems: count,
            totalPages: Math.ceil(count / size),
            currentPage: page,
            selectedCategory: null
        });

    } catch (err) {
        console.log(err);
    }
};