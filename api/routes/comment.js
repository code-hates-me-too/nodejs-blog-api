const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const commentController = require("../controllers/commentController");

router.post("/:commentid/reaction", verifyToken, commentController.comment_reaction_post);

module.exports = router;