require("dotenv").config();

const express = require("express");
const sequelize = require("./data/db");
const cors = require("cors");
const locals = require("./middlewares/locals");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const userRoutes = require("./routes/user");
const apiRoutes = require("./api/routes/index");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const log = require("./middlewares/log");
const errorHandling = require("./middlewares/error-handling");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();

app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const sessionStore = new SequelizeStore({
    db: sequelize
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    },
    store: sessionStore
}));
app.use(locals);
app.use("/api", apiRoutes);
app.use(csurf());

app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")));

// veritabanı ilişkiler
const Blog = require("./models/blog");
const Category = require("./models/category");
const User = require("./models/user");
const Role = require("./models/role");
const dummyData = require("./data/dummy-data");
const seedRoles = require("./seeders/roleSeeder");

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

Blog.belongsTo(User, {
    foreignKey: {
        name: "userid",
        allowNull: true
    }
});
User.hasMany(Blog, {
    foreignKey: "userid"
});

const UserRole = sequelize.define("UserRole", {}, {
    timestamps: false,
    freezeTableName: true
});
Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleid",
    otherKey: "userid"
});
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userid",
    otherKey: "roleid"
}); 

const Comment = require("./models/comment");
const CommentReaction = require("./models/commentReaction");

Comment.belongsTo(Blog, { foreignKey: "blogid" });
Blog.hasMany(Comment, { foreignKey: "blogid" });

Comment.belongsTo(User, { foreignKey: "userid" });
User.hasMany(Comment, { foreignKey: "userid" });

Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentid" });
Comment.hasMany(Comment, { as: "replies", foreignKey: "parentid" });

CommentReaction.belongsTo(Comment, { foreignKey: "commentid" });
Comment.hasMany(CommentReaction, { foreignKey: "commentid" });

CommentReaction.belongsTo(User, { foreignKey: "userid" });
User.hasMany(CommentReaction, { foreignKey: "userid" });

(async () => {
    // await sessionStore.sync();

    // await sequelize.sync({ force: true });

    // // await seedRoles();
    
    // await dummyData();
})();

app.use("/admin", adminRoutes);
app.use("/account", authRoutes);
app.use(userRoutes);
app.use((req, res) => {
    res.status(404).render("error/404", {title: "404 Not Found"});
});
app.use(log);
app.use(errorHandling);

app.listen(3000, () => {
    console.log("3000 portundan dinleniyor")
});
