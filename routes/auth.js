const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const csrf = require("../middlewares/csrf");

router.get("/register", csrf, authController.register_get);

router.post("/register", authController.register_post);

router.get("/login", csrf, authController.login_get);

router.post("/login", authController.login_post);

router.get("/logout", csrf, authController.logout_get);

module.exports = router;