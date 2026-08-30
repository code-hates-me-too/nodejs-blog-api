const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(); // token yok kayıt akışı olabilir engellemeden devam
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded; // varsa kimliği req.user'a koy
        }
        next(); // token hatalı olsa bile burayı engelleme, sadece req.user set edilmez
    });
};