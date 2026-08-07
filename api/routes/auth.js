const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/register", authController.register);

router.post("/login", authController.login);

// router.get("/logout", authController.logout_get);

// router.get("/reset-password", authController.reset_get);

// router.post("/reset-password", authController.reset_post);

// router.get("/new-password/:token", authController.newpassword_get);

// router.post("/new-password", authController.newpassword_post);

module.exports = router;