require("dotenv").config();

const express = require("express");
const path = require("path");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const mysql = require("mysql2");
const config = require("./config");

let connection = mysql.createConnection(config.db);

connection.connect((err) => {
    if(err){
        return console.log(err);
    }
    console.log("mysql server bağlantısı kuruldu");
});

const app = express();

app.set("view engine", "ejs");

app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(userRoutes);

app.listen(3000, () => {
    console.log("3000 portundan dinleniyor")
});
