const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const verifyToken = require("../middlewares/verifyToken");
const profileController = require("../controllers/profile");

router.get("/", verifyToken, profileController.profile_get);
router.put("/", verifyToken, profileController.profile_update_put);
router.put("/password", verifyToken, profileController.profile_password_put);

module.exports = router;