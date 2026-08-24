const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const blogContoller = require("../controllers/blog");


router.get("/category/:slug", blogContoller.blogs);

router.get("/:slug", blogContoller.blog_details);

router.get("/", blogContoller.mainpage);

module.exports = router;