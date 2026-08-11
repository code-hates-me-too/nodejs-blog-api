const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const verifyToken = require("../middlewares/verifyToken");

router.post("/register", authController.register_post);

router.post("/login", authController.login_post);

router.post("/logout", verifyToken, authController.logout_post);

router.get("/reset-password", authController.reset_get);

router.post("/reset-password", authController.reset_post);

router.get("/new-password/:token", authController.newpassword_get);

router.post("/new-password", authController.newpassword_post);

module.exports = router;