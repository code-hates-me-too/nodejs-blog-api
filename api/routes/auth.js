const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const verifyToken = require("../middlewares/verifyToken");
const optionalAuth = require("../middlewares/optionalAuth");

router.post("/register", authController.register_post);

router.post("/login", authController.login_post);

router.post("/logout", verifyToken, authController.logout_post);

router.post("/reset-password", authController.reset_post);

router.get("/new-password/:token", authController.newpassword_get);

router.post("/new-password", authController.newpassword_post);

router.get("/check-username", optionalAuth, authController.check_username);

router.get("/verify-email/:token", authController.verify_email_get);

router.post("/resend-verification", authController.resend_verification_post);

module.exports = router;