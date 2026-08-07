const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../../helpers/send-mail");
const config = require("../../config");

exports.register = async (req, res, next) => {
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

exports.login = async (req, res, next) => {
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

