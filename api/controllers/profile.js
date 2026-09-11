const User = require("../../models/user");
const { Op } = require("sequelize");
const fs = require("fs");
const bcrypt = require("bcrypt");

exports.profile_get = async (req, res, next) => {
    const userid = req.user.userid;
    try {
        const user = await User.findByPk(userid, {
            attributes: [
                "userid", "username", "bekleyenKullaniciAdi",
                "avatar", "bekleyenAvatar",
                "email", "emailDogrulandiMi", "createdAt"
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        return res.status(200).json({ success: true, data: user });

    } catch (err) {
        next(err);
    }
};

exports.profile_username_put = async (req, res, next) => {
    const userid = req.user.userid;
    const { username } = req.body;
    const adminMi = (req.user.roles || []).includes("admin");

    try {
        const user = await User.findByPk(userid);
        if (!user) {
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        if (adminMi) {
            if (username === user.username) {
                return res.status(400).json({ success: false, message: "Bu zaten mevcut kullanıcı adınız." });
            }

            user.username = username;
            user.sonKullaniciAdiDegisimi = new Date();
            user.bekleyenKullaniciAdi = null;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Kullanıcı adı güncellendi.",
                data: { username: user.username }
            });
        }

        if (user.bekleyenKullaniciAdi) {
            return res.status(400).json({
                success: false,
                message: "Zaten onay bekleyen bir kullanıcı adı değişikliğiniz var."
            });
        }

        if (user.sonKullaniciAdiDegisimi) {
            const gunFarki = (Date.now() - new Date(user.sonKullaniciAdiDegisimi).getTime()) / (1000 * 60 * 60 * 24);
            if (gunFarki < 180) {
                const kalanGun = Math.ceil(180 - gunFarki);
                return res.status(400).json({
                    success: false,
                    message: `Kullanıcı adınızı ${kalanGun} gün sonra tekrar değiştirebilirsiniz.`
                });
            }
        }

        if (username === user.username) {
            return res.status(400).json({ success: false, message: "Bu zaten mevcut kullanıcı adınız." });
        }

        if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: "Kullanıcı adı 3-30 karakter, küçük harf/rakam/_/- içerebilir."
            });
        }

        const cakisan = await User.findOne({
            where: { [Op.or]: [{ username }, { bekleyenKullaniciAdi: username }] }
        });
        if (cakisan) {
            return res.status(400).json({ success: false, message: "Bu kullanıcı adı kullanılıyor ya da onay bekliyor." });
        }

        user.bekleyenKullaniciAdi = username;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Kullanıcı adı değişikliği admin onayına gönderildi.",
            data: { bekleyenKullaniciAdi: username }
        });

    } catch (err) {
        next(err);
    }
};

exports.profile_avatar_put = async (req, res, next) => {
    const userid = req.user.userid;
    const adminMi = (req.user.roles || []).includes("admin");

    try {
        if (req.uploadError) {
            const msg = req.uploadError.code === "LIMIT_FILE_SIZE"
                ? "Resim boyutu 2MB'ı geçemez."
                : req.uploadError.message;
            return res.status(400).json({ success: false, message: msg });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Resim yüklenmedi." });
        }

        const user = await User.findByPk(userid);

        if (adminMi) {
            const eskiAvatar = user.avatar;

            user.avatar = req.file.filename;
            await user.save();

            if (eskiAvatar) {
                fs.unlink("./public/avatars/" + eskiAvatar, err => { if (err) console.log(err); });
            }

            return res.status(200).json({
                success: true,
                message: "Profil fotoğrafı güncellendi.",
                data: { avatar: user.avatar }
            });
        }

        if (user.bekleyenAvatar) {
            fs.unlink("./public/avatars/" + user.bekleyenAvatar, err => {
                if (err) console.log(err);
            });
        }

        user.bekleyenAvatar = req.file.filename;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profil fotoğrafı admin onayına gönderildi.",
            data: { bekleyenAvatar: user.bekleyenAvatar }
        });

    } catch (err) {
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
            return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Mevcut parola hatalı." });
        }

        if (newPassword.length < 7 || newPassword.length > 24) {
            return res.status(400).json({
                success: false,
                message: "Parola uzunluğu 7-24 karakter arası olmak zorundadır."
            });
        }

        user.password = newPassword;
        user.tokenVersion += 1; // parola değişince diğer cihazlardaki oturumlar geçersiz olsun

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Parolanız güncellendi. Güvenlik için diğer cihazlarda tekrar giriş yapmanız gerekecek."
        });

    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: "Parola güncellenemedi.", errors });
        }
        next(err);
    }
};