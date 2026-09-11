const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Çok fazla deneme yaptınız, 15 dakika sonra tekrar deneyin." },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Çok fazla kayıt denemesi yaptınız, daha sonra tekrar deneyin." },
    standardHeaders: true,
    legacyHeaders: false
});

const commentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { success: false, message: "Çok hızlı yorum gönderiyorsunuz, biraz yavaşlayın." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => (req.user?.roles || []).includes("admin")
});

module.exports = { loginLimiter, registerLimiter, commentLimiter };