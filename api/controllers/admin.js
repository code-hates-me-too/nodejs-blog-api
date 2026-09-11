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
const { oncekiHaliYakala } = require("../../helpers/blogOnay");
const { SNAPSHOT_ALANLARI } = require("../../helpers/blogOnay");
const { temizle } = require("../../helpers/sanitizeBlog");

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

        if (!isAdmin && blog.ilkOnayVerildiMi) {
            return res.status(403).json({
                success: false,
                message: "Yayınlanmış bir blog moderatör tarafından silinemez."
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
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;
    const resim = req.file ? req.file.filename : null;
    const userid = req.user.userid; 
    const kategoriIDler = req.body.categories
        ? [].concat(req.body.categories).map(id => Number(id))
        : [];

    const adminMi = (req.user.roles || []).includes("admin");
    const t = await sequelize.transaction();

    try {
        const blog = await Blog.create({
            baslik, altbaslik, aciklama: temizle(aciklama), resim, userid,
            onay: adminMi,
            ilkOnayVerildiMi: adminMi
        }, { transaction: t });

        if (kategoriIDler) {
            await blog.setCategories(kategoriIDler, { transaction: t });
        }

        await t.commit();

        // TODO Aşama 3: adminMi false ise adminlere "yeni onay bekliyor" maili

        return res.status(201).json({
            success: true,
            message: adminMi
                ? "Blog oluşturuldu."
                : "Blog oluşturuldu, admin onayı bekleniyor."
        });

    } catch (err) {
        if (t) await t.rollback();
        if (req.file) {
            fs.unlink("./public/images/" + req.file.filename, err => {
                if (err) console.log(err);
            });
        }
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: "Blog oluşturulamadı.", errors });
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
    const baslik = req.body.baslik;
    const altbaslik = req.body.altbaslik;
    const aciklama = req.body.aciklama;

    const kategoriIDler = req.body.categories
        ? [].concat(req.body.categories).map(id => Number(id))
        : [];
    const resimKaldir = req.body.resimKaldir === "true";

    const adminMi = (req.user.roles || []).includes("admin");
    const t = await sequelize.transaction();

    try {
        const blog = await Blog.findOne({
            where: { blogid },
            include: { model: Category, attributes: ["categoryid"] },
            transaction: t
        });

        if (!blog) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        }

        const eskiResim = blog.resim;

        if (!adminMi && blog.ilkOnayVerildiMi && blog.onay) {
            blog.oncekiOnayliHali = await oncekiHaliYakala(blog);
        }

        blog.baslik = baslik;
        blog.altbaslik = altbaslik;
        blog.aciklama = temizle(aciklama);
        
        if (req.file) {
            blog.resim = req.file.filename;
        } else if (resimKaldir) {
            blog.resim = null;
        }

        if (adminMi) {
            blog.onay = true;
            blog.ilkOnayVerildiMi = true;
            blog.oncekiOnayliHali = null;
        } else {
            blog.onay = false;
            blog.reddedildiMi = false;      // <- eklendi
            blog.reddedilmeNotu = null;     // <- eklendi
        }

        if (blog.categories.length) {
            await blog.removeCategories(blog.categories, { transaction: t });
        }
        if (kategoriIDler?.length) {
            const selectedCategories = await Category.findAll({
                where: { categoryid: { [Op.in]: kategoriIDler } },
                transaction: t
            });
            await blog.addCategories(selectedCategories, { transaction: t });
        }

        await blog.save({ transaction: t });
        await t.commit();

        if (adminMi && (req.file || resimKaldir) && eskiResim) {
            fs.unlink("./public/images/" + eskiResim, err => {
                if (err) console.log(err);
            });
        }

        return res.status(200).json({
            success: true,
            message: adminMi ? "Blog düzenlendi." : "Değişiklikler kaydedildi, admin onayı bekleniyor."
        });

    } catch (err) {
        if (t) await t.rollback();
        console.error("blog_edit_put hatası:", err); 
        if (err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: "Blog düzenlenemedi.", errors });
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
    try {
        let page = Number(req.query.page);
        if (!Number.isInteger(page) || page < 0) page = 0;
        const size = 20;

        const { rows, count } = await User.findAndCountAll({
            attributes: ["userid", "fullname", "username", "email", "avatar", "yorumEngelliMi"],
            include: { model: Role, attributes: ["roleid", "rolename"] },
            limit: size,
            offset: page * size,
            distinct: true,
            order: [["userid", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / size),
                currentPage: page,
                pageSize: size
            }
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
    const { email, username, roles } = req.body;
    const currentUserId = req.user.userid;

    try {
        const user = await User.findByPk(userid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        user.email = email;

        if (username !== undefined && username !== user.username) {
            user.username = username;
            user.sonKullaniciAdiDegisimi = new Date();
            user.bekleyenKullaniciAdi = null;
        }

        await user.save();

        if (roles) {
            const roleIds = Array.isArray(roles) ? roles : [roles];
            await setUserRoles(userid, roleIds, currentUserId);
        }

        const updatedUser = await User.findOne({
            where: { userid },
            attributes: ["userid", "fullname", "email", "username"],
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
            include: { model: Role, attributes: ["roleid", "rolename"] },
            limit: 10
        });

        return res.status(200).json({ success: true, data: users });

    } catch (err) {
        next(err);
    }
};

exports.blog_duzenleme_iptal_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    const userid = req.user.userid;

    try {
        const blog = await Blog.findOne({ where: { blogid, userid } });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        }

        if (blog.onay || !blog.ilkOnayVerildiMi || !blog.oncekiOnayliHali) {
            return res.status(400).json({
                success: false,
                message: "İptal edilecek bekleyen bir düzenleme yok."
            });
        }

        const iptalEdilenResim = blog.resim;
        const eskiResim = blog.oncekiOnayliHali.resim;
        const eskiKategoriIDler = blog.oncekiOnayliHali.kategoriIDler || [];

        for (const alan of SNAPSHOT_ALANLARI) {
            blog[alan] = blog.oncekiOnayliHali[alan];
        }
        blog.onay = true;
        blog.oncekiOnayliHali = null;
        await blog.save();

        const mevcutKategoriler = await blog.getCategories();
        if (mevcutKategoriler.length) {
            await blog.removeCategories(mevcutKategoriler);
        }
        if (eskiKategoriIDler.length) {
            await blog.addCategories(eskiKategoriIDler);
        }

        if (iptalEdilenResim && iptalEdilenResim !== eskiResim) {
            fs.unlink("./public/images/" + iptalEdilenResim, err => {
                if (err) console.log(err);
            });
        }

        return res.status(200).json({ success: true, message: "Değişiklikler iptal edildi." });

    } catch (err) {
        next(err);
    }
};

exports.kullanici_yorum_engelle_put = async (req, res, next) => {
    const userid = req.params.userid;
    const currentUserId = req.user.userid;
    try {
        if (String(userid) === String(currentUserId)) {
            return res.status(403).json({
                success: false,
                message: "Kendi yorum yapma yetkinizi kısıtlayamazsınız."
            });
        }

        const user = await User.findByPk(userid);
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        user.yorumEngelliMi = !user.yorumEngelliMi;
        await user.save();

        return res.status(200).json({
            success: true,
            message: user.yorumEngelliMi
                ? "Kullanıcının yorum yapması engellendi."
                : "Kullanıcının yorum yapma engeli kaldırıldı.",
            data: { yorumEngelliMi: user.yorumEngelliMi }
        });

    } catch (err) {
        next(err);
    }
};

exports.users_avatar_remove_put = async (req, res, next) => {
    const userid = req.params.userid;
    try {
        const user = await User.findByPk(userid);
        if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });

        if (user.avatar) {
            fs.unlink("./public/avatars/" + user.avatar, err => { if (err) console.log(err); });
        }

        user.avatar = null;
        await user.save();

        return res.status(200).json({ success: true, message: "Profil fotoğrafı kaldırıldı." });
    } catch (err) {
        next(err);
    }
};

