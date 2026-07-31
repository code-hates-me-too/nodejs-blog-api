const User = require("../models/user");
const bcrypt = require("bcrypt");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");
const { Op } = require("sequelize");

exports.register_get = async (req, res) => {
    try {
        return res.render("auth/register", {
            title: "Kullanıcı Kayıt"
        })
    } catch (err) {
        console.log(err);
    }
};

exports.register_post = async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.findOne({ where: { email: email }});
        if(user) {
            req.session.message = {
                text: "Girdiğiniz email ile daha önce kayıt olunmuş!",
                class: "warning"
            };

            return req.session.save(err => {
                if (err) {
                    console.log(err);
                }
                return res.redirect("login");
            });
        }
        
        const newUser = await User.create({
            fullname: name,
            email: email,
            password: hashedPassword
        });

        emailService.sendMail({
            from: config.email.from,
            to: newUser.email,
            subject: "Hesabınız Oluşturuldu",
            text: "Hesabınız başarıyla oluşturuldu"
        });

        req.session.message = {
            text: "Hesabınıza giriş yapabilirsiniz",
            class: "success"
        };

        return req.session.save(err => {if (err) {console.log(err);} return res.redirect("login");});
    } catch (err) {
        console.log(err);
    }
};

exports.login_get = async (req, res) => {
    const message = req.session.message;
    req.session.message = null;
    try {
        return res.render("auth/login", {
            title: "Kullanıcı Giriş",
            message: message
        })
    } catch (err) {
        console.log(err);
    }
};

exports.login_post = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            req.session.message = {
                text: "Girdiğiniz email ile kullanıcı bulunamadı",
                class: "danger"
            };

            return req.session.save(() => {
                res.redirect("/account/login");
            });
        }   

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            req.session.message = {
                text: "Parola hatalı",
                class: "danger"
            };

            return req.session.save(() => {
                res.redirect("/account/login");
            });
        }
        
        const userRoles = await user.getRoles({
            attributes: ["rolename"],
            raw: true
        });
        req.session.roles = userRoles.map((role) => role["rolename"]);
        req.session.isAuth = true;
        req.session.fullname = user.fullname;
        req.session.userid = user.userid;

        const url = req.query.returnUrl || "/";
        return req.session.save(err => {
            if (err) {
                console.log(err);
                return res.redirect("/account/login");
            }

            return res.redirect(url);
        });
        
    } catch (err) {
        console.log(err);
    }
};

exports.logout_get = async (req, res) => {
    try {
        return req.session.destroy(err => {
            if (err) {
                console.log(err);
                return res.redirect("/");
            }

            return res.redirect("/account/login");
        });
    } catch (err) {
        console.log(err);
    }
};

exports.reset_get = async (req, res) => {
    const message = req.session.message;
    req.session.message = null;
    try {
        return res.render("auth/reset-password", {
            title: "Reset Password",
            message: message
        });   
        
    } catch (err) {
        console.log(err);
    }
};

exports.reset_post = async (req, res) => {
    const email = req.body.email;
    try {
        var token = crypto.randomBytes(32).toString("hex");
        const user = await User.findOne({ where: { email: email}});

        if(!user) {
            req.session.message = {
                text: "Girilen emaile ait kullanıcı bulunamadı",
                class: "danger"
            };
            return res.redirect("reset-password");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + (1000*60*60);
        await user.save();

        emailService.sendMail({
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

        req.session.message = {text: "Parolanızı sıfırlamak için mailinizi kontrol ediniz", class: "success"};
        return req.session.save(err => {
            if (err) {
                console.log("Session kaydedilirken hata:", err);
            }

            return res.redirect("login");
        });
        
    } catch (err) {
        console.log(err);
    }
};

exports.newpassword_get = async (req, res) => {
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
        return res.render("auth/new-password", {
            title: "New Password",
            message: null,
            token: token,
            userid: user.userid
        });   
        
    } catch (err) {
        console.log(err);
    }
};

exports.newpassword_post = async (req, res) => {
    const token = req.body.token;
    const userid = req.body.userid;
    const newPassword = req.body.password;
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

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        req.session.message = {text: "Parolanız güncellendi", class: "success"};
        return req.session.save(err => {
            if (err) {
                console.log("Session kaydedilirken hata:", err);
            }

            return res.redirect("login");
        });
        
    } catch (err) {
        console.log(err);
    }
};
