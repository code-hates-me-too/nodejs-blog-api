const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Blog = sequelize.define("blog", {
    blogid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    baslik: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    altbaslik: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    aciklama: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    resim: {
        type: DataTypes.STRING,
        allowNull: false
    },
    anasayfa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    onay: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
}, {
    freezeTableName: true,
    validate: {
        checkValidOnay(){
            if(this.anasayfa && !this.onay) {
                throw new Error("Anasayfaya aldığınız blog onaylı olmak zorundadır");
            }
        }
    }
});

module.exports = Blog;