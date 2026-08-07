const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Yetkilendirme başlığı eksik veya hatalı."
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Oturum süresi dolmuş, lütfen tekrar giriş yapın."
                });
            }
            return res.status(401).json({
                success: false,
                message: "Geçersiz token."
            });
        }

        req.user = decoded; // { userid, fullname, email, roles }
        next();
    });
};