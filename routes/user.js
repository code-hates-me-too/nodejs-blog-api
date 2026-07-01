const express = require("express");
const path = require("path");
const router = express.Router();

const data = {
    title: "Blog App",
    categories: ["Web Geliştirme", "Mobil Uygulamalar", "Veri Analizi", "Programlama", "Mrogramlama"],
    blogs: [
        {
            blogid: 1,
            baslik: "Filler",
            aciklama: "Açıklama..",
            resim: "image1.jpg",
            anasayfa: true,
            onay: true
        },{
            blogid: 2,
            baslik: "Aslanlar",
            aciklama: "Açıklama..",
            resim: "image2.jpg",
            anasayfa: false,
            onay: true
        },{
            blogid: 3,
            baslik: "Gergedan Böcekleri",
            aciklama: "Açıklama..",
            resim: "image3.jpg",
            anasayfa: false,
            onay: false
        },{
            blogid:4,
            baslik: "Atlar",
            aciklama: "Açıklama..",
            resim: "image4.jpg",
            anasayfa: true,
            onay: true
        }
    ]
}

router.use("/blogs/:blogid", (req, res) => {
    res.render("users/blog-details");
});

router.use("/blogs", (req, res) => {
    res.render("users/blogs", data);
});

router.use("/", (req, res) => {
    res.render("users/index", data);
});

module.exports = router;