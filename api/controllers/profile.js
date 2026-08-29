const bcrypt = require("bcrypt");
const User = require("../../models/user");
const Blog = require("../../models/blog");
const Category = require("../../models/category");
const Role = require("../../models/role");

exports.profile_get = async (req, res, next) => {
    const userid = req.user.userid;
    try {
        const user = await User.findByPk(userid, {
            attributes: ["userid", "fullname", "email", "createdAt"]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (err) {
        next(err);
    }
};

exports.profile_update_put = async (req, res, next) => {
    const userid = req.user.userid;
    const { fullname, email } = req.body;

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

        return res.status(200).json({
            success: true,
            message: "Profil bilgileri güncellendi.",
            data: {
                userid: user.userid,
                fullname: user.fullname,
                email: user.email
            }
        });

    } catch (err) {
        if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Profil güncellenemedi.",
                errors: errors
            });
        }
        next(err);
    }
};

exports.profile_password_put = async (req, res, next) => {
    const userid = req.user.userid;
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Mevcut ve yeni parola zorunludur."
            });
        }

        const user = await User.findByPk(userid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Mevcut parola hatalı."
            });
        }

        if (newPassword.length < 7 || newPassword.length > 24) {
            return res.status(400).json({
                success: false,
                message: "Parola uzunluğu 7-24 karakter arası olmak zorundadır."
            });
        }

        user.password = newPassword;
        user.tokenVersion += 1; // parola değişince tüm cihazlardaki oturumlar geçersiz olur

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Parolanız güncellendi. Güvenlik için tekrar giriş yapmanız gerekecek."
        });

    } catch (err) {
        if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Parola güncellenemedi.",
                errors: errors
            });
        }
        next(err);
    }
};