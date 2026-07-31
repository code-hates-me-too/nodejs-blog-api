module.exports = (req, res, next) => {
    if(!req.session.isAuth) {
        return res.redirect("/account/login?returnUrl=" + req.originalUrl);
    }

    if(!req.session.roles.includes("admin")) {
        req.session.message = { text: "Bu sayfa için yetkiniz yok", class: "warning"};
        return req.session.save(err => {
            if (err) {
                console.log(err);
            }

            return res.redirect("/account/login?returnUrl=" + req.originalUrl);
        });
    }
    next();
};