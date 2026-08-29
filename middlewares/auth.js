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

        next();

    } catch (err) {
        next(err);
    }
};