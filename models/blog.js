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
        unique: true,
        validate: {
            notEmpty: {
                msg: "Başlık boş bırakılamaz."
            },
            len: {
                args: [2, 200],
                msg: "Başlık 2 ile 200 karakter arasında olmalıdır."
            }
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    altbaslik: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Alt başlık boş bırakılamaz."
            },
            len: {
                args: [10, 255],
                msg: "Alt başlık en az 10 karakter olmalıdır."
            }
        }
    },
    aciklama: {
        type: DataTypes.TEXT,
        allowNull: false,
        notEmpty: {
            msg: "Açıklama boş bırakılamaz."
        }
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