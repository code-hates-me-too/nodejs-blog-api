const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");
const slugField = require("../helpers/slugfield");

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
        unique: {
            args: true,
            msg: "Bu başlık kullanılıyor."
        },
        validate: {
            notEmpty: {
                msg: "Başlık boş geçilemez."
            },
            len: {
                args: [2, 200],
                msg: "Başlık uzunluğu en az 2 karakter olmalıdır."
            }
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: {
            args: true,
            msg: "Blog başlığının oluşturduğu bağlantı (URL) başka bir blog tarafından kullanılıyor. Lütfen başlığı biraz değiştirerek tekrar deneyin."
        },
        validate: {
            notEmpty: {
                msg: "Blog bağlantısı oluşturulamadı."
            }
        }
    },
    altbaslik: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Alt başlık boş geçilemez."
            },
            len: {
                args: [2, 255],
                msg: "Alt başlık en az 2 karakter olmalıdır."
            }
        }
    },
    aciklama: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Açıklama boş geçilemez."
            }
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

Blog.beforeValidate((blog, options) => {
    if (blog.changed("baslik")) {
        blog.url = slugField(blog.baslik);
    }

    if (options.fields && !options.fields.includes("url")) {
        options.fields.push("url");
    }
});

module.exports = Blog;