const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../data/db");

router.get("/blogs/create", async (req, res) => {
    try {
        const [categories, ] = await db.execute("SELECT * FROM category") 
        
        res.render("admins/blog-create", {
            title: "Create Blog",
            categories: categories
        });

    } catch (err) {
        console.write(err);
    }
});

router.post("/blogs/create", async (req, res) => {
    const baslik = req.body.baslik;
    const aciklama = req.body.aciklama;
    const resim = req.body.resim;
    const anasayfa = req.body.anasayfa == "on" ? 1 : 0;
    const onay = req.body.onay == "on" ? 1 : 0;
    const kategori = req.body.kategori;

    try {
        await db.execute(`INSERT INTO blog(baslik, aciklama, resim, anasayfa, onay, categoryid)
        VALUES (?,?,?,?,?,?)`, [baslik, aciklama, resim, anasayfa, onay, kategori]);
        res.redirect("/");
    } catch (err) {
        console.write(err);
    }
});

router.get("/blogs", (req, res) => {
    res.render("admins/blog-list", {title: "Edit Blogs"});
});

module.exports = router;