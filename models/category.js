const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");
const slugField = require("../helpers/slugfield");

const Category = sequelize.define("category", {
    categoryid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    categoryname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "Bu kategori adı kullanılıyor"
        },
        validate: {
            notEmpty: {
                msg: "Kategori adı girmelisiniz"
            },
            len: {
                args: [2, 255],
                msg: "Kategori ismi en az iki harf olmalıdır"
            }
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "Kategori başlığının oluşturduğu bağlantı (URL) başka bir kategori tarafından kullanılıyor. Lütfen başlığı biraz değiştirerek tekrar deneyin."
        },
        validate: {
            notEmpty: {
                msg: "Kategori ismi boş geçilemez."
            }
        }
    },
}, {
    timestamps: false,
    freezeTableName: true
}
);

Category.beforeValidate((category, options) => {
    category.url = slugField(category.categoryname);

    if (options.fields && !options.fields.includes("url")) {
        options.fields.push("url");
    }
});

module.exports = Category;