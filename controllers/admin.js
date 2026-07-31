const fs = require("fs");
const Blog = require("../models/blog");
const Category = require("../models/category");
const Role = require("../models/role");
const User = require("../models/user");
const { Op, where } = require("sequelize");
const sequelize = require("../data/db");
const slugField = require("../helpers/slugfield");
const { url } = require("inspector");

exports.get_categories_remove = async (req, res) => {
    const blogid = req.body.blogid;
    const categoryid = req.body.categoryid;
    const url = req.body.categoryurl;

    await sequelize.query(`delete from BlogCategory where blogid=${blogid} and categoryid=${categoryid}`);
    res.redirect("/admin/categories/"+ url);
}; 

exports.categories_delete_get = async (req, res) => {
    const slug = req.params.slug;
    try {
        const category = await Category.findOne({
            where: {
                url: slug
            }
    });
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
    const url = slugField(baslik);

    try {
        await Category.create({ 
            categoryname: baslik,
            url: url
        });
        res.redirect("/admin/categories?action=create");
    } catch (err) {
        console.log(err);
    }
}; 

exports.categories_edit_get = async (req, res) => {
    const slug = req.params.slug;

    try {
        const category = await Category.findOne({
            where: {
                url: slug
            }
        });
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
    const url = slugField(baslik);

    try {
        const pickedCategory = await Category.findByPk(categoryid);
        if(pickedCategory) {
            pickedCategory.categoryname = baslik;
            pickedCategory.url = url;

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
            action: req.query.action,
        });
    } catch (err) {
        console.log(err);
    }
}; 

exports.blog_delete_get = async (req, res) => {
    const slug = req.params.slug;
    const userid = req.session.userid;
    const isAdmin = req.session.roles.includes("admin");

    try {
        const blog = await Blog.findOne({
            where: isAdmin ? { url: slug } : {
                url: slug,
                userid: userid
            }
        });
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
    const kategoriIDler = req.body.categories;
    const userid = req.session.userid;

    try {
        const blog = await Blog.create({
            baslik: baslik,
            url: slugField(baslik),
            altbaslik: altbaslik,
            aciklama: aciklama,
            resim: resim,
            anasayfa: anasayfa,
            onay: onay,
            userid: userid
        });

        await blog.setCategories(kategoriIDler);
        res.redirect("/admin/blogs?action=create");

    } catch (err) {
        console.log(err);
    }
}; 

exports.blog_edit_get = async (req, res) => {
    const slug = req.params.slug;
    const userid = req.session.userid;
    const isAdmin = req.session.roles.includes("admin");

    try {
        const blog = await Blog.findOne({
            where: isAdmin ? { url: slug } : { url: slug, userid: userid },
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

        return res.redirect("/admin/blogs");

    } catch (err) {
        console.log(err);
    }
}; 

exports.blog_edit_post = async (req, res) => {
    const blogid = req.body.blogid;
    const baslik = req.body.baslik;
    const url = slugField(baslik);
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const userid = req.session.userid;

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
                blogid: blogid,
                userid: userid
            }, 
            include: {
                model: Category,
                attributes: ["categoryid"]
            }
        });
        if(blog) {
            blog.baslik = baslik;
            blog.url = url;
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
    const userid = req.session.userid;
    const isAdmin = req.session.roles.includes("admin");
    const isModerator = req.session.roles.includes("moderator");
    try {

        const blogs = await Blog.findAll({
            include: {
                model: Category,
                attributes: ["categoryname"]
            },
            where: isModerator && !isAdmin ? { userid: userid } : null
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

exports.roles_get = async (req, res) => {
    try {
        const roles = await Role.findAll({
            attributes: {
                include: ["role.roleid", "role.rolename", [sequelize.fn("COUNT", sequelize.col("users.userid")), "user_count"]]
            },
            include: [
                {model: User, attributes: ["userid"]}
            ],
            group: ["role.roleid"],
            raw: true,
            includeIgnoreAttributes: false
        });

        return res.render("admins/role-list", {
            title: "Role Listesi",
            roles: roles
        });
    } catch (err) {
        console.log(err);
    }
};

exports.roles_create_post = async (req, res) => {
    const rolename = req.body.rolename;
    try {
        await Role.create({
            rolename: rolename
        });

        return res.redirect("/admin/roles");

    } catch (err) {
        console.log(err);
    }
};

exports.roles_delete_get = async (req, res) => {
    const roleid = req.params.roleid;
    try {
        const role = await Role.findOne({
            where: {
                roleid: roleid
            },
            include: {
                model: User
            }
        });

        return res.render("admins/role-delete", {
            title: "Delete" + role.rolename,
            role: role
        });
    } catch (err) {
        console.log(err);
    }
};

exports.roles_delete_post = async (req, res) => {
    const roleid = req.body.roleid;

    try {
        const role = await Role.findByPk(roleid, {
            include: User
        });

        if (!role) {
            return res.status(404).send("Rol bulunamadı.");
        }

        if (role.users.length > 0) {
            req.session.message = {
                text: "Bu role atanmış kullanıcılar olduğu için silinemez.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) console.log(err);
                return res.redirect("/admin/roles");
            });
        }

        await role.destroy();

        return res.redirect("/admin/roles");

    } catch (err) {
        console.log(err);
    }
};

exports.role_remove_post = async (req, res) => {
    const roleid = req.body.roleid;
    const rolename = req.body.rolename;
    const userid = req.body.userid;
    try {
        const user = await User.findByPk(userid);
        const role = await Role.findByPk(roleid);

        await user.removeRole(role);

        return res.redirect("/admin/roles/" + req.body.roleid);
    } catch (err) {
        console.log(err);
    }
};

exports.role_edit_get = async (req, res) => {
    const roleid = req.params.roleid;
    try {
        const role = await Role.findOne({
            where: {
                roleid: roleid
            }
        });
        const users = await role.getUsers();

        if(role) {
            return res.render("admins/role-edit", {
                title: role.rolename + "Edit",
                role: role,
                users: users
            });
        }
        return res.redirect("/roles");

    } catch (err) {
        console.log(err);
    }
};

exports.role_edit_post = async (req, res) => {
    const roleid = req.body.roleid;
    const rolename = req.body.rolename;
    try {
        await Role.update(
            {
                rolename: rolename
            },
            {
                where: {
                    roleid: roleid
                }
            }
        );
        return res.redirect("/admin/roles");

    } catch (err) {
        console.log(err);
    }
};

exports.users_get = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["userid", "fullname", "email"],
            include: {
                model: Role,
                attributes: ["rolename"]
            }
        });

        return res.render("admins/users-list", {
            title: "User List",
            users: users,
            message: null,
            action: null,
        });

    } catch (err) {
        console.log(err);
    }
};

exports.users_edit_get = async (req, res) => {
    const userid = req.params.userid;
    try {
        const user = await User.findOne({
            where: {
                userid: userid
            },
            include: {
                model: Role,
                attributes: ["roleid"]
            }
        });

        const roles = await Role.findAll();

        return res.render("admins/users-edit", {
            title: user.fullname + "Edit",
            user: user,
            roles: roles,
            message: null,
            action: null
        })

    } catch (err) {
        console.log(err);
    }
};

exports.users_edit_post = async (req, res) => {
    const userid = req.body.userid;
    const fullname = req.body.fullname;
    const email = req.body.email;
    const roleIds = req.body.roles;
    try {
        const user = await User.findOne({
            where: { userid: userid },
            include: { model: Role, attributes: ["roleid"] },
        });

        if(user) {
            user.fullname = fullname;
            user.email = email;
            
            if(roleIds == undefined) {
                await user.removeRoles(user.roles);
            } else {
                await user.removeRoles(user.roles);
                const selectedRoles = await Role.findAll({
                    where: {
                        roleid: {
                            [Op.in]: roleIds
                        }
                    }
                });
                await user.addRoles(selectedRoles);
            }
            await user.save();
            return res.redirect("/admin/users");
        }

        return res.redirect("/admin/users");

    } catch (err) {
        console.log(err);
    }
};

