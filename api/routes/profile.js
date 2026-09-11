const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const profileController = require("../controllers/profile");
const { handleUpload } = require("../../helpers/image-upload");
const avatarUpload = require("../../helpers/avatar-upload");

router.get("/", verifyToken, profileController.profile_get);
router.put("/username", verifyToken, profileController.profile_username_put);
router.put("/avatar", verifyToken, handleUpload(avatarUpload.upload.single("avatar")), profileController.profile_avatar_put);
router.put("/password", verifyToken, profileController.profile_password_put);

module.exports = router;