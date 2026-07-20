const express = require("express");
const path = require("path");
const router = express.Router();
const userController = require("../controllers/user");

router.get("/blogs/category/:categoryid", userController.blogs_by_category);

router.get("/blogs/:blogid", userController.blog_details);

router.get("/blogs", userController.blogs);

router.get("/", userController.mainpage);

module.exports = router;