require("dotenv").config();

const express = require("express");
const path = require("path");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

// veritabanı ilişkiler
const sequelize = require("./data/db");
const Blog = require("./models/blog");
const Category = require("./models/category");
const BlogCategory = sequelize.define("BlogCategory", {}, {
    timestamps: false,
    freezeTableName: true
});
Blog.belongsToMany(Category, {
    through: BlogCategory,
    foreignKey: "blogid",
    otherKey: "categoryid"
});
Category.belongsToMany(Blog, {
    through: BlogCategory,
    foreignKey: "categoryid",
    otherKey: "blogid"
});
(async () => {
    await sequelize.sync({ alter: true });
})();

app.use("/admin", adminRoutes);
app.use(userRoutes);

app.listen(3000, () => {
    console.log("3000 portundan dinleniyor")
});
