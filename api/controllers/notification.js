const Notification = require("../../models/notification");


exports.notifications_get = async (req, res, next) => {
    try {
        const bildirimler = await Notification.findAll({
            where: { userid: req.user.userid },
            order: [["createdAt", "DESC"]]
        });
        return res.status(200).json({ success: true, data: bildirimler });
    } catch (err) {
        next(err);
    }
};

exports.notifications_clear_delete = async (req, res, next) => {
    try {
        await Notification.destroy({ where: { userid: req.user.userid } });
        return res.status(200).json({ success: true, message: "Bildirimler temizlendi." });
    } catch (err) {
        next(err);
    }
};