const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const notificationController = require("../controllers/notification");

router.get("/", verifyToken, notificationController.notifications_get);
router.delete("/", verifyToken, notificationController.notifications_clear_delete);

module.exports = router;