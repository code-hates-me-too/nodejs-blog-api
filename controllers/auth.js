const User = require("../models/user");
const bcrypt = require("bcrypt");

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
            req.session.message = { text: "Girdiğiniz email ile daha önce kayıt olunmuş!", class: "warning"};
            return res.redirect("login");
        }
        await User.create({
            fullname: name,
            email: email,
            password: hashedPassword
        });
        req.session.message = { text: "Hesabınıza giriş yapabilirsiniz", class: "success"};
        return res.redirect("login");
    } catch (err) {
        console.log(err);
    }
};

exports.login_get = async (req, res) => {
    const message = req.session.message;
    delete req.session.message;
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
        return res.redirect(url);
        
    } catch (err) {
        console.log(err);
    }
};

exports.logout_get = async (req, res) => {
    try {
        await req.session.destroy();
        return res.redirect("/account/login");
    } catch (err) {
        console.log(err);
    }
};