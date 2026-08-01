const User = require("../models/user");
const bcrypt = require("bcrypt");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");
const { Op } = require("sequelize");

exports.register_get = async (req, res, next) => {
    try {
        return res.render("auth/register", {
            title: "Kullanıcı Kayıt",
            message: null
        });
    } catch (err) {
        next(err);
    }
};

exports.register_post = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
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

        req.session.message = {
            text: "Hesabınıza giriş yapabilirsiniz",
            class: "success"
        };

        return req.session.save(err => {if (err) {console.log(err);} return res.redirect("login");});
    } catch (err) {
        let msg = "";
        if(err.name == "SequelizeValidationError" || err.name == "SequelizeUniqueConstraintError") {
            for(let e of err.errors) {
                msg += e.message + " || "
            }

            return res.render("auth/register", {
                title: "Kullanıcı Kayıt",
                message: { text: msg, class: "danger"},
                values: { 
                fullname: name,
                email: email,
                password: password
                }
            })
        } else {
            next(err);
        }

    }
};

exports.login_get = async (req, res, next) => {
    const message = req.session.message;
    const values = req.session.values;
    delete req.session.message;
    delete req.session.values;
    try {
        return res.render("auth/login", {
            title: "Kullanıcı Giriş",
            message: message,
            values: values
        })
    } catch (err) {
        next(err);
    }
};

exports.login_post = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {

        if (!email || !password) {
            return res.render("auth/login", {
                title: "Kullanıcı Giriş",
                message: {
                    text: "Email ve parola alanları zorunludur.",
                    class: "danger"
                },
                values: {
                    email
                }
            });
        }
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            req.session.message = {
                text: "Email veya parola hatalı",
                class: "danger"
            };
            req.session.values = {email: email}

            return req.session.save(err => {
                if (err) {
                    return next(err);
                }

                return res.redirect("/account/login");
            });
        }   

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            req.session.message = {
                text: "Email veya parola hatalı",
                class: "danger"
            };
            req.session.values = {email: email}

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
        next(err);
    }
};

exports.logout_get = async (req, res, next) => {
    try {
        return req.session.destroy(err => {
            if (err) {
                console.log(err);
                return res.redirect("/500");
            }

            return res.redirect("/account/login");
        });
    } catch (err) {
        console.log(err);
    }
};

exports.reset_get = async (req, res, next) => {
    const message = req.session.message;
    delete req.session.message;
    try {
        return res.render("auth/reset-password", {
            title: "Reset Password",
            message: message
        });   
        
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.reset_post = async (req, res, next) => {
    const email = req.body.email;
    try {
        var token = crypto.randomBytes(32).toString("hex");
        const user = await User.findOne({ where: { email: email}});

        if (!user) {
            req.session.message = {
                text: "Eğer bu e-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderildi.",
                class: "success"
            };

            return req.session.save(err => {
                if (err) {
                    return next(err);
                }

                return res.redirect("login");
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

        req.session.message = {text: "Eğer bu e-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderildi.", class: "success"};
        return req.session.save(err => {
            if (err) {
                console.log("Session kaydedilirken hata:", err);
            }

            return res.redirect("login");
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
            req.session.message = {
                text: "Parola sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                class: "danger"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/account/reset-password");
            });
        } 
        
        return res.render("auth/new-password", {
            title: "Yeni Parola",
            token,
            userid: user.userid,
            message: null
        });
        
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.newpassword_post = async (req, res, next) => {
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

      
        if (!user) {
            req.session.message = {
                text: "Parola sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
                class: "danger"
            };

            return req.session.save(err => {
                if (err) return next(err);
                return res.redirect("/account/reset-password");
            });
        } 

        if (!newPassword || newPassword.length < 7 || newPassword.length > 24) {
            return res.render("auth/new-password", {
                title: "Yeni Parola",
                message: {
                    text: "Parola uzunluğu 7-24 karakter arası olmak zorundadır ",
                    class: "danger"
                },
                token,
                userid
            });
        }

        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        req.session.message = {text: "Parolanız güncellendi", class: "success"};
        return req.session.save(err => {
            if (err) {
                console.log("Session kaydedilirken hata:", err);
            }

            return res.redirect("/account/login");
        });
        
    } catch(err) {
        if (
            err.name == "SequelizeValidationError" ||
            err.name == "SequelizeUniqueConstraintError"
        ) {

            let msg = "";

            for (let e of err.errors) {
                msg += e.message + " ";
            }

            return res.render("auth/new-password", {
                title: "Yeni Parola",
                message: {
                    text: msg,
                    class: "danger"
                },
                token,
                userid
            });

        }
        console.log(err);
        next(err);
    }
};
