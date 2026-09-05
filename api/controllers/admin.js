const fs = require("fs");
const Blog = require("../../models/blog");
const Category = require("../../models/category");
const Role = require("../../models/role");
const User = require("../../models/user");
const { Op } = require("sequelize");
const sequelize = require("../../data/db");
const slugField = require("../../helpers/slugfield");
const SYSTEM_ROLE_SLUGS = require("../../helpers/systemRoles");
const { addRoleToUser, removeRoleFromUser } = require("../../services/roleService");
const { setUserRoles } = require("../../services/roleService");

exports.categories_delete_delete = async (req, res, next) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id, {
            include: Blog
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Silinecek kategori bulunamadı."
            });
        }

        if (category.blogs && category.blogs.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Bu kategoriye ait bloglar olduğu için silinemez.",
                blogCount: category.blogs.length
            });
        }
        const deletedCount = await Category.destroy({
            where: {
                categoryid: id
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Kategori silindi."
        });
    } catch (err) {
        next(err);
    }
}; 

exports.categories_remove_delete = async (req, res, next) => {
    const { blogid, categoryid } = req.params;
    try {
        const category = await Category.findByPk(categoryid);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }
        const blog = await Blog.findByPk(blogid);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog bulunamadı."
            });
        }
        await category.removeBlog(blog);

        return res.status(200).json({
            success: true,
            message: "Blog kategoriden çıkarıldı."
        });
    } catch (err) {
        next(err);
    }
}; 

exports.categories_create_post = async (req, res, next) => {
    const { baslik } = req.body;

    try {
        const category = await Category.create({ 
            categoryname: baslik,
        });

        return res.status(201).json({
            success: true,
            message: "Kategori oluşturuldu.",
            data: category
        });
    } catch (err) {

        if (
            err.name === "SequelizeValidationError" ||
            err.name === "SequelizeUniqueConstraintError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Kategori oluşturulamadı.",
                errors: err.errors.map(e => ({
                    field: e.path,
                    value: e.value,
                    message: e.message
                }))
            });
        }

        next(err);
    }
}; 

exports.categories_edit_get = async (req, res, next) => {
    const id = req.params.id;

    try {
        const category = await Category.findOne({
            where: {
                categoryid: id
            }
        });
        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                category,
                blogs: await category.getBlogs(),
                blogCount: await category.countBlogs()
            }
        });

    } catch (err) {
        next(err);
    }
}; 

exports.categories_edit_put = async (req, res, next) => {
    const { baslik } = req.body;
    try {
        const category = await Category.findOne({
            where: {
                categoryid: req.params.id
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }
        
        category.categoryname = baslik;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Kategori başarıyla güncellendi.",
            data: category
        });

    } catch (err) {

        if (
            err.name === "SequelizeValidationError" ||
            err.name === "SequelizeUniqueConstraintError"
        ) {

            return res.status(400).json({
                success: false,
                message: "Kategori güncellenemedi.",
                errors: err.errors.map(e => ({
                    field: e.path,
                    value: e.value,
                    message: e.message
                }))
            });

        }

        next(err);
    }

}; 

exports.categories_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    try {
        const categories = await Category.findAll({
            attributes: {
                include: [
                    [
                        sequelize.fn(
                            "COUNT",
                            sequelize.col("blogs.blogid")
                        ),
                        "blog_count"
                    ]
                ]
            },
            include: [
                {
                    model: Blog,
                    attributes: [],
                    through: {
                        attributes: []
                    }
                }
            ],
            group: ["category.categoryid"]
        });
        return res.status(200).json({
            success: true,
            count: categories.length,
            categories: categories
        });
    } catch (err) {
        next(err);
    }
}; 

exports.blog_delete_delete = async (req, res, next) => {
    const blogid = req.params.id;
    const userid = req.user.userid;
    try {
        const roles = req.user.roles || [];
        const isAdmin = roles.includes("admin");
        
        const blog = await Blog.findOne({
            where: isAdmin
                ? { blogid: blogid }
                : { blogid: blogid, userid: userid }
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Silinecek blog bulunamadı."
            });
        }
        const image = blog.resim;
        await blog.destroy();
        if (image) {
            fs.unlink("./public/images/" + image, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
        return res.status(200).json({
            success: true,
            message: "Blog silindi."
        });
    } catch (err) {
        next(err);
    }
}; 

exports.blog_create_get = async (req, res, next) => {
    try {
        const categories = await Category.findAll();

        return res.status(200).json({
            success: true,
            data: {
                categories: categories
            }
        });

    } catch (err) {
        next(err);
    }
}; 

exports.blog_create_post = async (req, res, next) => {
    const {
        baslik,
        altbaslik,
        aciklama,
        anasayfa,
        onay,
        categories
    } = req.body;

    const resim = req.file ? req.file.filename : "";
    const userid = req.user.userid;

    const t = await sequelize.transaction();

    try {
        const blog = await Blog.create({
            baslik: baslik,
            altbaslik: altbaslik,
            aciklama: aciklama,
            resim: resim,
            anasayfa: anasayfa ? 1 : 0,
            onay: onay ? 1 : 0,
            userid: userid
        }, {
            transaction: t
        });
        if (categories && categories.length) {
            await blog.setCategories(categories, {
                transaction: t
            });
        }
        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Blog oluşturuldu.",
            data: {
                blog: blog
            }
        });

    } catch (err) {
        if (t) { await t.rollback(); }
        if (req.file) {
            fs.unlink("./public/images/" + req.file.filename, err => {
                if (err) console.log(err);
            });
        }   
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);

            return res.status(400).json({
                success: false,
                message: "Blog oluşturulamadı.",
                errors: errors,
                values: {
                    baslik,
                    altbaslik,
                    aciklama,
                    anasayfa,
                    onay,
                    categories
                }
            });
        }
        next(err);
    }
}; 

exports.blog_edit_get = async (req, res, next) => {
    const { blogid } = req.params;
    const userid = req.user.userid;
    const roles = req.user.roles || [];
    
    try {
        const isAdmin = roles.includes("admin");

        const blog = await Blog.findOne({
            where: isAdmin
                ? { blogid: blogid }
                : { blogid: blogid, userid: userid },
            include: {
                model: Category,
                attributes: ["categoryid"]
            }
        });
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog bulunamadı."
            });
        }
        const categories = await Category.findAll({
            attributes: ["categoryid", "categoryname"]
        });
        return res.status(200).json({
            success: true,
            data: {
                blog,
                categories
            }
        });

    } catch (err) {
        next(err);
    }
}; 

exports.blog_edit_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    const {
        baslik,
        altbaslik,
        aciklama,
        anasayfa,
        onay,
        categories,
        eskiResim,
        resimKaldir
    } = req.body;
    const userid = req.user.userid;
    const roles = req.user.roles || [];

    const resim = req.file
        ? req.file.filename
        : eskiResim;

    let t;
    let blog; 
    try {
        const isAdmin = roles.includes("admin");

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

            return res.status(404).json({
                success: false,
                message: "Blog bulunamadı."
            });
        }

        blog.baslik = baslik;
        blog.altbaslik = altbaslik;
        blog.aciklama = aciklama;
        blog.resim = resim;
        if (resimKaldir === "true" && !req.file) {

            blog.resim = null;

            if (eskiResim) {
                fs.unlink(
                    "./public/images/" + eskiResim,
                    err => {
                        if (err) console.log(err);
                    }
                );
            }
        }
        blog.anasayfa = anasayfa === "true" || anasayfa === "1";
        blog.onay = onay === "true" || onay === "1";

        if (blog.categories.length) {
            await blog.removeCategories(
                blog.categories,
                { transaction: t }
            );
        }
        if (categories) {

            const kategoriIDler = Array.isArray(categories)
                ? categories
                : [categories];

            const selectedCategories = await Category.findAll({
                where: {
                    categoryid: {
                        [Op.in]: kategoriIDler
                    }
                },
                transaction: t
            });

            await blog.addCategories(
                selectedCategories,
                { transaction: t }
            );
        }

        await blog.save({ transaction: t });
        await t.commit();

        if (req.file && req.body.eskiResim) {
            fs.unlink(
                "./public/images/" + req.body.eskiResim,
                err => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Blog başarıyla güncellendi.",
            data: blog
        });

    } catch (err) {
        if (t) await t.rollback();
        if (req.file) {
            fs.unlink("./public/images/" + req.file.filename, err => {
                if (err) console.log(err);
            });
        }

        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Blog güncellenemedi.",
                errors: err.errors.map(e => ({
                    field: e.path,
                    value: e.value,
                    message: e.message
                })),                
                values: {
                    baslik,
                    altbaslik,
                    aciklama,
                    resim,
                    anasayfa,
                    onay,
                    categories
                }
            });
        }

        next(err);
    }
};

exports.blogs_get = async (req, res, next) => {
    try {
        const roles = req.user.roles;
        const userid = req.user.userid;

        const isAdmin = roles.includes("admin");
        const isModerator = roles.includes("moderator");
        const blogs = await Blog.findAll({
            include: [
                {
                    model: Category,
                    attributes: ["categoryname"]
                },
                {
                    model: User,
                    attributes: ["username"]   
                }
            ],
            where: isModerator && !isAdmin
                ? { userid: userid }
                : undefined
        });

        return res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (err) {
        next(err);
    }
}; 

exports.users_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    try {
        const users = await User.findAll({
            attributes: ["userid", "fullname", "email", "username", "avatar"],
            include: {
                model: Role,
                attributes: ["rolename"]
            }
        });

        return res.status(200).json({
            success: true,
            data: users
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

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        const roles = await Role.findAll();

        return res.status(200).json({
            success: true,
            data: {
                user: user,
                roles: roles
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.users_edit_put = async (req, res, next) => {
    const userid = req.params.userid;
    const { fullname, email, roles } = req.body;
    const currentUserId = req.user.userid;

    try {
        const user = await User.findByPk(userid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        user.fullname = fullname;
        user.email = email;
        await user.save();

        if (roles) {
            const roleIds = Array.isArray(roles) ? roles : [roles];
            await setUserRoles(userid, roleIds, currentUserId);
        }

        const updatedUser = await User.findOne({
            where: { userid },
            attributes: ["userid", "fullname", "email"],
            include: { model: Role, attributes: ["roleid", "rolename"] }
        });

        return res.status(200).json({
            success: true,
            message: "Kullanıcı bilgileri düzenlendi.",
            data: updatedUser
        });

    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Kullanıcı bilgileri düzenlenemedi.",
                errors: err.errors.map(e => ({
                    field: e.path,
                    value: e.value,
                    message: e.message
                }))
            });
        }

        if (err.statusCode) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }

        next(err);
    }
};

exports.roles_get = async (req, res, next) => {
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

        const rolesWithFlag = roles.map(role => ({
            ...role,
            isSystemRole: SYSTEM_ROLE_SLUGS.includes(role.slug)
        }));

        return res.status(200).json({
            success: true,
            data: rolesWithFlag
        });

    } catch (err) {
        next(err);
    }
};

exports.role_edit_get = async (req, res, next) => {
    const roleid = req.params.roleid;
    try {
        const role = await Role.findOne({
            where: {
                roleid: roleid
            }
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Aranan rol bulunamadı."
            });
        }

        const users = await role.getUsers({
            attributes: ["userid", "username", "email", "avatar"]
        });

        return res.status(200).json({
            success: true,
            data: {
                role: {
                    roleid: role.roleid,
                    rolename: role.rolename
                },
                isSystemRole: SYSTEM_ROLE_SLUGS.includes(role.slug),
                users: users
            }
        });

    } catch (err) {
        next(err);
    }
};

exports.role_edit_put = async (req, res, next) => {
    const roleid = req.params.roleid;
    const { rolename } = req.body;
    try {
        const role = await Role.findOne({
            where: {
                roleid: roleid
            }
        });
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Aranan rol bulunamadı."
            });
        }

        if (SYSTEM_ROLE_SLUGS.includes(role.slug)) {
            return res.status(403).json({
                success: false,
                message: "Yerleşik roller düzenlenemez."
            });
        }

        role.rolename = rolename;
        await role.save();

        return res.status(200).json({
            success: true,
            message: "Rol düzenlendi.",
            data: {
                roleid: role.roleid,
                rolename: role.rolename
            }
        });

    } catch (err) {
         if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);

            return res.status(400).json({
                success: false,
                message: "Rol düzenlenemedi.",
                errors: errors,
                values: {
                    rolename: rolename
                }
            });
        }

        next(err);
    }
};

exports.roles_create_post = async (req, res, next) => {
    const { rolename } = req.body;
    try {
        const role = await Role.create({
            rolename: rolename
        });

        return res.status(201).json({
            success: true,
            message: "Rol eklendi.",
            data: {
                roleid: role.roleid,
                rolename: role.rolename
            }
        });

    } catch (err) {
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => ({
                field: e.path,
                value: e.value,
                message: e.message
            }));

            return res.status(400).json({
                success: false,
                message: "Rol eklenemedi.",
                errors: errors,
                values: {
                    rolename: rolename
                }
            });
        }

        next(err);
    }
};

exports.role_remove_delete = async (req, res, next) => {
    const { roleid, userid } = req.body;
    const currentUserId = req.user.userid;

    try {
        await removeRoleFromUser(userid, roleid, currentUserId);

        return res.status(200).json({
            success: true,
            message: "Kullanıcının rolü kaldırıldı."
        });

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }
        next(err);
    }
};

exports.roles_delete_delete = async (req, res, next) => {
    const roleid = req.params.roleid;
    try {
        const role = await Role.findByPk(roleid, {
            include: {
                model: User,
                attributes: ["userid"]
            }
        });

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Rol bulunamadı."
            });
        }

        if (SYSTEM_ROLE_SLUGS.includes(role.slug)) {
            return res.status(403).json({
                success: false,
                message: "Yerleşik roller silinemez."
            });
        }

        if (role.users.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Bu role atanmış kullanıcılar olduğu için silinemez.",
                userCount: role.users.length
            });
        }

        await role.destroy();

        return res.status(200).json({
            success: true,
            message: "Rol silindi."
        });

    } catch (err) {
        next(err);
    }
};

exports.role_add_post = async (req, res, next) => {
    const { roleid, userid } = req.body;
    try {
        const { user } = await addRoleToUser(userid, roleid);

        return res.status(200).json({
            success: true,
            message: "Kullanıcı role eklendi.",
            data: {
                userid: user.userid,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        next(err);
    }
};

exports.users_search_get = async (req, res, next) => {
    const { username } = req.query;
    try {
        const query = (username || "").trim().toLowerCase();

        if (query.length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        const users = await User.findAll({
            where: {
                username: { [Op.like]: `%${query}%` }
            },
            attributes: ["userid", "username", "email", "avatar"],
            limit: 10
        });

        return res.status(200).json({ success: true, data: users });

    } catch (err) {
        next(err);
    }
};