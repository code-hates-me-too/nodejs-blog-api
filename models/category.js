const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Category = sequelize.define("category", {
    categoryid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    categoryname: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false
}
);

const categoryDB = async () => {
    await Category.sync({ alter: true });
    console.log("kategori tablosu eklendi")
};

categoryDB();

module.exports = Category;