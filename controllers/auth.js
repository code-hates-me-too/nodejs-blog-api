const User = require("../models/user");
const bcrypt = require("bcrypt");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");

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
            return res.render("auth/login", {
                title: "Kullanıcı Giriş",
                message: { text: "Girdiğiniz email ile daha önce kayıt olunmuş!", class: "danger"}
            });
        }   

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("auth/login", {
                title: "Kullanıcı Giriş",
                message: { text: "Parola hatalı", class: "danger"}
            });
        }
        
        req.session.isAuth = true;
        req.session.fullname = user.fullname;

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
                    <a href="https://localhost:3000/account/reset-password/${token}">Parola Sıfırla</a>
                </p>
            `
        });

        req.session.message = {text: "Parolanızı sıfırlamak için mailinizi kontrol ediniz", class: "success"};
        return res.redirect("login");
        
    } catch (err) {
        console.log(err);
    }
};