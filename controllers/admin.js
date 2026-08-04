const fs = require("fs");
const Blog = require("../models/blog");
const Category = require("../models/category");
const Role = require("../models/role");
const User = require("../models/user");
const { Op, where } = require("sequelize");
const sequelize = require("../data/db");
const slugField = require("../helpers/slugfield");
const { url } = require("inspector");

exports.get_categories_remove = async (req, res, next) => {
    const blogid = req.body.blogid;
    const categoryid = req.body.categoryid;
    const url = req.body.categoryurl;
    try {
        await sequelize.query(`delete from BlogCategory where blogid=${blogid} and categoryid=${categoryid}`);
        return res.redirect("/admin/categories/"+ url);
    } catch (err) {
        next(err);
    }
}; 

exports.categories_delete_get = async (req, res, next) => {
    const slug = req.params.slug;
    try {
        const category = await Category.findOne({
            where: {
                url: slug
            },
            include: Blog
        });

        if (!category) {
            req.session.message = {
                text: "Kategori bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/categories");
            });
        }
        return res.render("admins/category-delete", {
            title: "Delete Category",
            category: category
        });
    } catch (err) {
        next(err);
    }
}; 

exports.categories_delete_post = async (req, res, next) => {
    const delcategoryid = req.body.categoryid;
    try {
        const category = await Category.findOne({
            where: {
                categoryid: delcategoryid
            },
            include: Blog
        });
        if (!category) {
            req.session.message = {
                text: "Silinecek kategori bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/admin/categories");
            });
        }   

        if (category.blogs.length > 0) {
            req.session.message = {
                text: "Bu kategoriye ait bloglar olduğu için silinemez",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/categories");
            });
        }
        const deletedCount = await Category.destroy({
            where: {
                categoryid: delcategoryid
            }
        });

        if (deletedCount === 0) {
            req.session.message = {
                text: "Silinecek kategori bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/categories");
            });
        }

        req.session.message = {
            text: "Kategori silindi.",
            class: "success"
        };

        return req.session.save(err => {
            if (err) return next(err);

            return res.redirect("/admin/categories");
        });
    } catch (err) {
        next(err);
    }
}; 

exports.categories_create_get = async (req, res, next) => {
    const message = req.session.message;
    delete req.session.message;
    try {
        return res.render("admins/category-create", {
            title: "Create Category",
            message: message
        });

    } catch (err) {
        next(err);
    }
}; 

exports.categories_create_post = async (req, res, next) => {
    const baslik = req.body.baslik;

    try {
        await Category.create({ 
            categoryname: baslik,
        });

        req.session.message = {
            text: "Kategori oluşturuldu.",
            class: "success"
        };

        return req.session.save(err => {
            if (err) return next(err);
            return res.redirect("/admin/categories");

        });
    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            return res.render("admins/category-create", {
                title: "Create Category",
                message: { text: msg, class: "danger" },
                values: {
                    baslik
                },
            });
        }
        next(err);
    }
}; 

exports.categories_edit_get = async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const category = await Category.findOne({
            where: {
                url: slug
            }
        });
        if(!category) {
            req.session.message = {
                text: "Kategori bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/categories");
            });
        }

        const blogs = await category.getBlogs();
        const blogCount = await category.countBlogs();
        
        return res.render("admins/category-edit", {
            title: " Kategori Edit",
            category: category,
            blogs: blogs,
            blogCount: blogCount,
            message: null
        });

    } catch (err) {
        next(err);
    }
}; 

exports.categories_edit_post = async (req, res, next) => {
    const categoryid = req.body.categoryid;
    const baslik = req.body.baslik;
    let category;
    try {
        category = await Category.findByPk(categoryid);
        if(category) {
            category.categoryname = baslik;

            await category.save();
            req.session.message = {
                text: "Kategori düzenlendi.",
                class: "success"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/admin/categories");
            });
        }
        
        req.session.message = {
            text: "Kategori düzenlenemedi.",
            class: "warning"
        };

        return req.session.save(err => {
            if (err) return next(err);
            return res.redirect("/admin/categories");
        });

    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            return res.render("admins/category-edit", {
                title: baslik + " Edit",
                message: { text: msg, class: "danger" },
                values: { baslik, categoryid },
                category: category,
                blogCount: category ? await category.countBlogs() : 0,
                blogs: category ? await category.getBlogs() : []
            });
        }
        next(err);
    }
}; 

exports.categories_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    try {
        const categories = await Category.findAll();
        return res.render("admins/category-list", {
            title: "Edit Categories",
            categories: categories,
            categoriesCount: categories.length,
            action: req.query.action,
            message: message
        });
    } catch (err) {
        next(err);
    }
}; 

exports.blog_delete_get = async (req, res, next) => {
    const slug = req.params.slug;
    const userid = req.session.userid;
    
    try {
        const isAdmin = req.session.roles.includes("admin");
        const blog = await Blog.findOne({
            where: isAdmin ? { url: slug } : {
                url: slug,
                userid: userid
            }
        });
        if(blog) {
            return res.render("admins/blog-delete", {
                title: "Delete Blog",
                blog: blog,
                message: null
            });
        }
        if(!blog) {
            req.session.message = {
                text: "Silinecek blog bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/blogs");
            });
        }
        return res.redirect("/admin/blogs");
    } catch (err) {
        next(err);
    }
}; 

exports.blog_delete_post = async (req, res, next) => {
    const delblogid = req.body.blogid;
    try {
        const blog = await Blog.findByPk(delblogid);
        if(blog) {
            const image = blog.resim;
            await blog.destroy();
            if (image) {
                fs.unlink("./public/images/" + image, err => {
                    if (err) console.log(err);
                });
            }
            return res.redirect("/admin/blogs?action=delete");
        }
        if(!blog) {
            req.session.message = {
                text: "Silinecek blog bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);

                return res.redirect("/admin/blogs");
            });
        }
        return res.redirect("/admin/blogs");
    } catch (err) {
        next(err);
    }
}; 

exports.blog_create_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    try {
        const categories = await Category.findAll();

        return res.render("admins/blog-create", {
            title: "Create Blog",
            categories: categories,
            message: message
        });

    } catch (err) {
        next(err);
    }
}; 

exports.blog_create_post = async (req, res, next) => {
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const resim = req.file ? req.file.filename : "";
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategoriIDler = req.body.categories;
    const userid = req.session.userid;

    const t = await sequelize.transaction();

    try {
        const blog = await Blog.create({
            baslik: baslik,
            altbaslik: altbaslik,
            aciklama: aciklama,
            resim: resim,
            anasayfa: anasayfa,
            onay: onay,
            userid: userid
        }, { transaction: t});
        if(kategoriIDler) {
            await blog.setCategories(kategoriIDler, { transaction: t });
        }
        await t.commit();

        req.session.message = {
            text: "Blog oluşturuldu.",
            class: "success"
        };

        return req.session.save(err => {
            if (err) return next(err);
            return res.redirect("/admin/blogs");
        });

    } catch (err) {
        if (t) { await t.rollback(); }
        if (req.file) {
            fs.unlink("./public/images/" + req.file.filename, err => {
                if (err) console.log(err);
            });
        }   
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            return res.render("admins/blog-create", {
                title: "Create Blog",
                categories: await Category.findAll(),
                message: {text: msg, class: "danger"},
                values: {
                    baslik: baslik,
                    altbaslik: altbaslik,
                    aciklama: aciklama
                }
            });
        }
        next(err);
    }
}; 

exports.blog_edit_get = async (req, res, next) => {
    const slug = req.params.slug;
    const userid = req.session.userid;
    
    try {
        const isAdmin = req.session.roles.includes("admin");
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
                title: "Edit" + blog.baslik,
                blog: blog,
                categories: categories,
                message: null
            });
        }
        if(!blog) {
            req.session.message = {
                text: "Silinecek blog bulunamadı.",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/admin/blogs");
            });
        }

    } catch (err) {
        next(err);
    }
}; 

exports.blog_edit_post = async (req, res, next) => {
    const blogid = req.body.blogid;
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const userid = req.session.userid;
    const resim = req.file ? req.file.filename : req.body.eskiResim;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategoriIDler = req.body.categories;

    let t;
    let blog; 
    try {
        const isAdmin = (req.session.roles || []).includes("admin");
        t = await sequelize.transaction();

        blog = await Blog.findOne({   
            where: isAdmin ? { blogid: blogid } : { blogid: blogid, userid: userid },
            include: {
                model: Category,
                attributes: ["categoryid"]
            },
            transaction: t
        });

        if (!blog) {
            await t.rollback();
            return res.redirect("/admin/blogs");
        }

        blog.baslik = baslik;
        blog.altbaslik = altbaslik;
        blog.aciklama = aciklama;
        blog.resim = resim;
        blog.anasayfa = anasayfa;
        blog.onay = onay;

        if (blog.categories.length) {
            await blog.removeCategories(blog.categories, { transaction: t });
        }
        if (kategoriIDler && kategoriIDler.length) {
            const selectedCategories = await Category.findAll({
                where: { categoryid: { [Op.in]: kategoriIDler } },
                transaction: t
            });
            await blog.addCategories(selectedCategories, { transaction: t });
        }

        await blog.save({ transaction: t });
        await t.commit();

        if (req.file) {
            fs.unlink("./public/images/" + req.body.eskiResim, err => {
                if (err) console.log(err);
            });
        }

        req.session.message = {
            text: "Blog düzenlendi.",
            class: "success"
        };

        return req.session.save(err => {
            if (err) return next(err);
            return res.redirect("/admin/blogs");
        });

    } catch (err) {
        if (t) await t.rollback();
        if (req.file) {
            fs.unlink("./public/images/" + req.file.filename, err => {
                if (err) console.log(err);
            });
        }

        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            const categories = await Category.findAll();

            return res.render("admins/blog-edit", {
                title: "Edit " + baslik,
                message: { text: msg, class: "danger" },
                blog: blog,          
                categories: categories,
                values: {
                    baslik, altbaslik, aciklama, resim, anasayfa, onay,
                    categories: kategoriIDler || []
                }
            });
        }

        next(err);
    }
};

exports.blogs_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    const userid = req.session.userid;
    try {
        const isAdmin = req.session.roles.includes("admin");
        const isModerator = req.session.roles.includes("moderator");
        const blogs = await Blog.findAll({
            include: {
                model: Category,
                attributes: ["categoryname"]
            },
            where: isModerator && !isAdmin ? { userid: userid } : null
        });

        return res.render("admins/blog-list", {
            title: "Blog List",
            blogs: blogs,
            action: req.query.action,
            message: message
        });
    } catch (err) {
        next(err);
    }
}; 

exports.roles_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
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
            roles: roles,
            message: message
        });
    } catch (err) {
        next(err);
    }
};

exports.roles_create_post = async (req, res, next) => {
    const rolename = req.body.rolename;
    try {
        await Role.create({
            rolename: rolename
        });

        req.session.message = {
            text: "Rol eklendi.",
            class: "warning"
        };

        return req.session.save(err => {
            if (err) return next(err);

            return res.redirect("/admin/roles");
        });

    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

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
                roles: roles,
                values: { rolename },
                message: { text: msg, class: "danger"}
            });
        }

        next(err);
    }
};

exports.roles_delete_get = async (req, res, next) => {
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
        next(err);
    }
};

exports.roles_delete_post = async (req, res, next) => {
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
        req.session.message = {
            text: "Rol silindi.",
            class: "warning"
        };

        return req.session.save(err => {
            if (err) console.log(err);
            return res.redirect("/admin/roles");
        });

    } catch (err) {
        next(err);
    }
};

exports.role_remove_post = async (req, res, next) => {
    const roleid = req.body.roleid;
    const rolename = req.body.rolename;
    const userid = req.body.userid;
    try {
        const user = await User.findByPk(userid);
        const role = await Role.findByPk(roleid);

        await user.removeRole(role);

        return res.redirect("/admin/roles/" + req.body.roleid);
    } catch (err) {
        next(err);
    }
};

exports.role_edit_get = async (req, res, next) => {
    const roleid = req.params.roleid;
    const message = req.session.message || null;
    req.session.message = null; 
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
                users: users,
                message: message
            });
        }
        req.session.message = {
            text: "Aranan rol bulunamadı",
            class: "warning"
        };

        return req.session.save(err => {
            if (err) console.log(err);
            return res.redirect("/admin/roles");
        });

    } catch (err) {
        next(err);
    }
};

exports.role_edit_post = async (req, res, next) => {
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
        req.session.message = {
            text: "Rol düzenlendi",
            class: "success"
        };

        return req.session.save(err => {
            if (err) console.log(err);
            return res.redirect("/admin/roles");
        });

    } catch (err) {
         if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            const role = await Role.findOne({
                where: {
                  roleid: roleid
                }
            });
            const users = await role.getUsers();

            return res.render("admins/role-edit", {
                title: role.rolename + "Edit",
                role: role,
                users: users,
                message: { text: msg, class: "danger"},
                values: { rolename: rolename }
            });
        }

        next(err);
    }
};

exports.users_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
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
            message: message,
        });

    } catch (err) {
        next(err);
    }
};

exports.users_edit_get = async (req, res, next) => {
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
        });

    } catch (err) {
        next(err);
    }
};

exports.users_edit_post = async (req, res, next) => {
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
            req.session.message = {
                text: "Kullanıcı bilgileri düzenlendi.",
                class: "success"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/admin/users");
            });
        }
        req.session.message = {
            text: "Kullanıcı bilgileri düzenlenemedi.",
            class: "danger"
        };

        return req.session.save(err => {
            if (err) return next(err);
            return res.redirect("/admin/users");
        });

    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            let msg = "";
            for (let e of err.errors) msg += e.message + " || ";

            const categories = await Category.findAll();
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
                message: { text: msg, class: "danger"},
            });
        }

        next(err);
    }
};

