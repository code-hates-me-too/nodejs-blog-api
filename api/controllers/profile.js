const User = require("../../models/user");
const fs = require("fs");

exports.profile_get = async (req, res, next) => {
    const userid = req.user.userid;
    try {
        const user = await User.findByPk(userid, {
            attributes: ["userid", "username", "bio", "avatar", "email", "createdAt"]
            // fullname bilinçli olarak dışarıda bırakıldı — public/profil katmanında gösterilmiyor
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
    const { username, bio } = req.body;

    try {
        const user = await User.findByPk(userid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı."
            });
        }

        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profil güncellendi.",
            data: {
                userid: user.userid,
                username: user.username,
                bio: user.bio
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

exports.profile_avatar_put = async (req, res, next) => {
    const userid = req.user.userid;

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
        const eskiAvatar = user.avatar;

        user.avatar = req.file.filename;
        await user.save();

        if (eskiAvatar) {
            fs.unlink("./public/avatars/" + eskiAvatar, err => {
                if (err) console.log(err);
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profil fotoğrafı güncellendi.",
            data: { avatar: user.avatar }
        });

    } catch (err) {
        next(err);
    }
};