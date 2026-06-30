const express = require("express");
const path = require("path");
const router = express.Router();

router.use("/create", (req, res) => {
    res.render("/admins/blog-create");
});

router.use("/blogs/:blogid", (req, res) => {
    res.render("/admins/blog-edit");
});

router.use("/blogs", (req, res) => {
    res.render("/admins/blog-list");
});

module.exports = router;