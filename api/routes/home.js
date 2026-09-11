const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog");

router.get("/rastgele", blogController.rastgele_blog_get);
router.get("/", blogController.home_get);

module.exports = router;