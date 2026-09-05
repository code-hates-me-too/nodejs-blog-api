const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const blogController = require("../controllers/blog");


router.get("/categories", blogController.categories_get);

router.get("/category/:slug", blogController.blogs);

router.get("/:slug", blogController.blog_details);

router.get("/", blogController.blogs);

module.exports = router;