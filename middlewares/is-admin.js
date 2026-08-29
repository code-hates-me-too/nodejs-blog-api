const User = require("../models/user");

module.exports = async (req, res, next) => {
    if (!req.session.isAuth) {
        return res.redirect("/account/login?returnUrl=" + req.originalUrl);
    }

    try {
        const currentUser = await User.findByPk(req.session.userid, {
            attributes: ["tokenVersion"]
        });

        if (!currentUser || currentUser.tokenVersion !== req.session.tokenVersion) {
            return req.session.destroy(() => {
                return res.redirect("/account/login?returnUrl=" + req.originalUrl);
            });
        }

        if (!req.session.roles.includes("admin")) {
            req.session.message = { text: "Bu sayfa için yetkiniz yok", class: "warning" };
            return req.session.save(err => {
                if (err) console.log(err);
                return res.redirect("/account/login?returnUrl=" + req.originalUrl);
            });
        }

        next();

    } catch (err) {
        next(err);
    }
};