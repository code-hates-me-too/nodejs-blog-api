const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const commentController = require("../controllers/commentController");

router.delete("/:commentid", verifyToken, requireRole("admin"), commentController.yorum_sil_delete);

module.exports = router;