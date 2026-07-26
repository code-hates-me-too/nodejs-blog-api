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
        await User.create({
            fullname: name,
            email: email,
            password: hashedPassword
        });

        return res.redirect("login");
    } catch (err) {
        console.log(err);
    }
};

exports.login_get = async (req, res) => {
    try {
        return res.render("auth/login", {
            title: "Kullanıcı Giriş",
            message: null
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
                message: "Email hatalı"
            });
        }   

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("auth/login", {
                title: "Kullanıcı Giriş",
                message: "Parola hatalı"
            });
        }
        
        return res.redirect("/");
        
    } catch (err) {
        console.log(err);
    }
};