const express = require("express");
const path = require("path");

const app = express();

app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/blogs/:blogid", (req, res) => {
    console.log(req.params.blogid);
    res.sendFile(path.join(__dirname, "/views/users", "blog-details.html"));
});

app.use("/blogs", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "blogs.html"));
});

app.use("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/users", "index.html"));
});

app.listen(3000, () => {
    console.log("3000 portundan dinleniyor")
});