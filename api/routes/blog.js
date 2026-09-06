const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const optionalAuth = require("../middlewares/optionalAuth");
const commentController = require("../controllers/commentController");
const requireRole = require("../middlewares/requireRole");
const blogController = require("../controllers/blog");


router.get("/categories", blogController.categories_get);

router.get("/category/:slug", blogController.blogs);

router.get("/:blogid/comments", optionalAuth, commentController.comments_get);

router.post("/:blogid/comments", verifyToken, commentController.comments_post);

router.post("/comments/:commentid/reaction", verifyToken, commentController.comment_reaction_post);

router.get("/:slug", blogController.blog_details);

router.get("/", blogController.blogs);

module.exports = router;