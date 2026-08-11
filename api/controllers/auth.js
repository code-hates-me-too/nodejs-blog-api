const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../../helpers/send-mail");
const config = require("../../config");

exports.register_post = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const newUser = await User.create({
            fullname: name,
            email: email,
            password: password
        });

        emailService.sendMail({
            from: config.email.from,
            to: newUser.email,
            subject: "Hesabınız Oluşturuldu",
            text: "Hesabınız başarıyla oluşturuldu"
        });

        const userRoles = await newUser.getRoles({
            attributes: ["rolename"],
            raw: true
        });
        const roles = userRoles.map(role => role.rolename);

        const token = jwt.sign(
            {
                userid: newUser.userid,
                fullname: newUser.fullname,
                email: newUser.email,
                roles: roles
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            success: true,
            message: "Kayıt başarılı.",
            token: token,
            user: {
                userid: newUser.userid,
                fullname: newUser.fullname,
                email: newUser.email,
                roles: roles
            }
        });

    } catch (err) {
        if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Kayıt başarısız.",
                errors: errors
            });
        }
        next(err);
    }
};

exports.login_post = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email ve parola zorunludur."
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email veya parola hatalı."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Email veya parola hatalı."
            });
        }

        const userRoles = await user.getRoles({
            attributes: ["rolename"],
            raw: true
        });
        const roles = userRoles.map(role => role.rolename);

        const token = jwt.sign(
            {
                userid: user.userid,
                fullname: user.fullname,
                email: user.email,
                roles: roles
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            message: "Giriş başarılı.",
            token: token,
            user: {
                userid: user.userid,
                fullname: user.fullname,
                email: user.email,
                roles: roles
            }
        });

    } catch (err) {
        console.log("LLLLLLLLLLLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANNNNNNNNNNNNNNNNNNNNNNn");
    }
};

exports.logout_post = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Çıkış başarılı."
        });

    } catch (err) {
        next(err);
    }
};

exports.reset_post = async (req, res, next) => {
    const email = req.body.email;
    try {
        const token = crypto.randomBytes(32).toString("hex");
        const user = await User.findOne({ where: { email: email}});

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "Eğer bu e-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderildi."
            });
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + (1000*60*60);
        await user.save();

        await emailService.sendMail({
            from: config.email.from,
            to: user.email,
            subject: "Parola Sıfırlama",
            html: `
                <p>Parolarınızı güncellemek için aşağıdaki linke tıklayın</p>
                <p>
                    <a href="http://localhost:3000/account/new-password/${token}">Parola Sıfırla</a>
                </p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Eğer bu e-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderildi."
        });
        
    } catch (err) {
        console.log(err);
        next(err);
    }
};  

exports.newpassword_get = async (req, res, next) => {
    const token = req.params.token;
    try {   
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Parola sıfırlama bağlantısı geçersiz veya süresi dolmuş."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parola sıfırlama bağlantısı geçerli.",
            token: token,
            userid: user.userid
        });
        
    } catch (err) {
        next(err);
    }
};

exports.newpassword_post = async (req, res, next) => {
    const { token, userid, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: {
                    [Op.gt]: Date.now()
                },
                userid: userid
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Parola sıfırlama bağlantısı geçersiz veya süresi dolmuş."
            });
        }

        if (!password || password.length < 7 || password.length > 24) {
            return res.status(400).json({
                success: false,
                message: "Parola uzunluğu 7-24 karakter arası olmak zorundadır."
            });
        }

        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiration = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Parolanız başarıyla güncellendi."
        });
        
    } catch(err) {
        if (
            err.name == "SequelizeValidationError" ||
            err.name == "SequelizeUniqueConstraintError"
        ) {
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