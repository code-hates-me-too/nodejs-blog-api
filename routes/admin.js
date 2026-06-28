const express = require("express");
const path = require("path");
const router = express.Router();

router.use("/create", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/admins", "blog-create.html"));
});

router.use("/blogs/:blogid", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/admins", "blog-edit.html"));
});

router.use("/blogs", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/admins", "blog-list.html"));
});

module.exports = router;