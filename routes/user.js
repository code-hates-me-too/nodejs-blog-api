const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../data/db");

router.get("/blogs/:blogid", (req, res) => {
    res.render("users/blog-details");
});

router.get("/blogs", async (req, res) => {
    try {
        const [blogs] = await db.execute(
            "SELECT * FROM blog WHERE onay=1"
        );

        const [categories] = await db.execute(
            "SELECT * FROM category"
        );

        res.render("users/blogs", {
            title: "Tüm Bloglar",
            blogs,
            categories
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/", async (req, res) => {
    try{
        const [blogs] = await db.execute(
            "SELECT * FROM blog WHERE onay=1 AND anasayfa=1"
        );

        const [categories] = await db.execute(
            "SELECT * FROM category"
        );

        res.render("users/index", {
            title: "Anasayfa",
            blogs,
            categories
        });

    } catch (err) {
        console.log(err);
    }
});

module.exports = router;