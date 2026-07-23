const fs = require("fs");
const Blog = require("../models/blog");
const Category = require("../models/category");
const { Op } = require("sequelize");
const sequelize = require("../data/db");

exports.get_categories_remove = async (req, res) => {
    const blogid = req.body.blogid;
    const categoryid = req.body.categoryid;

    await sequelize.query(`delete from BlogCategory where blogid=${blogid} and categoryid=${categoryid}`);
    res.redirect("/admin/categories/"+ categoryid);
};

exports.categories_delete_get = async (req, res) => {
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
};

exports.categories_delete_post = async (req, res) => {
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
};

exports.categories_create_get = async (req, res) => {
    try {
        res.render("admins/category-create", {
            title: "Create Category",
        });

    } catch (err) {
        console.log(err);
    }
};

exports.categories_create_post = async (req, res) => {
    const baslik = req.body.baslik;

    try {
        await Category.create({ categoryname: baslik});
        res.redirect("/admin/categories?action=create");
    } catch (err) {
        console.log(err);
    }
};

exports.categories_edit_get = async (req, res) => {
    const pickedcategoryid = req.params.categoryid;

    try {
        const category = await Category.findByPk(pickedcategoryid);
        const blogs = await category.getBlogs();
        const blogCount = await category.countBlogs();
        
        if(category) {
            return res.render("admins/category-edit", {
                title: " Kategori Edit",
                category: category,
                blogs: blogs,
                blogCount: blogCount
            });
        }

        res.redirect("/admin/categories");

    } catch (err) {
        console.log(err);
    }
};

exports.categories_edit_post = async (req, res) => {
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
};

exports.categories_get = async (req, res) => {
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
};

exports.blog_delete_get = async (req, res) => {
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
};

exports.blog_delete_post = async (req, res) => {
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
}; 

exports.blog_create_get = async (req, res) => {
    try {
        const categories = await Category.findAll();

        res.render("admins/blog-create", {
            title: "Create Blog",
            categories: categories
        });

    } catch (err) {
        console.log(err);
    }
};

exports.blog_create_post = async (req, res) => {
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
};

exports.blog_edit_get = async (req, res) => {
    const pickedblogid = req.params.blogid;

    try {
        const blog = await Blog.findOne({
            where: {
                blogid: pickedblogid
            },
            include: {
                model: Category,
                attributes: ["categoryid"]
            }
        });
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
};

exports.blog_edit_post = async (req, res) => {
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
    const kategoriIDler = req.body.categories;


    try {
        const blog = await Blog.findOne({
            where: {
                blogid: blogid
            }, 
            include: {
                model: Category,
                attributes: ["categoryid"]
            }
        });
        if(blog) {
            blog.baslik = baslik;
            blog.altbaslik = altbaslik;
            blog.aciklama = aciklama;
            blog.resim = resim;
            blog.anasayfa = anasayfa;
            blog.onay = onay;

            if(kategoriIDler == undefined) {
                await blog.removeCategories(blog.categories);
            } else {
                await blog.removeCategories(blog.categories);
                const selectedCategories = await Category.findAll({
                    where: {
                        categoryid: {
                            [Op.in]: kategoriIDler
                        }
                    }
                });
                await blog.addCategories(selectedCategories);
            }

            await blog.save();
            return res.redirect("/admin/blogs?action=edit");
        }
        res.redirect("/admin/blogs");

    } catch (err) {
        console.log(err);
    }
};

exports.blogs_get = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            include: {
                model: Category,
                attributes: ["categoryname"]
            }
        });

        res.render("admins/blog-list", {
            title: "Edit Blogs",
            blogs: blogs,
            action: req.query.action
        });
    } catch (err) {
        console.log(err);
    }
};