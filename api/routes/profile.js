const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const profileController = require("../controllers/profile");
const { handleUpload } = require("../../helpers/image-upload");
const avatarUpload = require("../../helpers/avatar-upload");

router.get("/", verifyToken, profileController.profile_get);

router.put("/", verifyToken, profileController.profile_update_put);

router.put(
    "/avatar",
    verifyToken,
    handleUpload(avatarUpload.upload.single("avatar")),
    profileController.profile_avatar_put
);

module.exports = router;