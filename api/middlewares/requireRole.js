module.exports = function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Giriş yapmanız gerekiyor."
            });
        }

        const hasRole = req.user.roles?.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: "Bu işlem için yetkiniz yok."
            });
        }

        next();
    };
};