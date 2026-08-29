const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Yetkilendirme başlığı eksik veya hatalı."
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            const message = err.name === "TokenExpiredError"
                ? "Oturum süresi dolmuş, lütfen tekrar giriş yapın."
                : "Geçersiz token.";
            return res.status(401).json({ success: false, message });
        }

        try {
            const currentUser = await User.findByPk(decoded.userid, {
                attributes: ["tokenVersion"]
            });

            if (!currentUser || currentUser.tokenVersion !== decoded.tokenVersion) {
                return res.status(401).json({
                    success: false,
                    message: "Yetkileriniz değişti, lütfen tekrar giriş yapın."
                });
            }

            req.user = decoded; // { userid, fullname, email, roles, tokenVersion }
            next();

        } catch (dbErr) {
            next(dbErr);
        }
    });
};