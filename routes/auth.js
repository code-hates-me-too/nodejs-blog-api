const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const csrf = require("../middlewares/csrf");

router.get("/register", csrf, authController.register_get);

router.post("/register", authController.register_post);

router.get("/login", csrf, authController.login_get);

router.post("/login", authController.login_post);

router.get("/logout", csrf, authController.logout_get);

router.get("/reset-password", csrf, authController.reset_get);

router.post("/reset-password", authController.reset_post);

router.get("/new-password/:token", csrf, authController.newpassword_get);

router.post("/new-password", authController.newpassword_post);

module.exports = router;