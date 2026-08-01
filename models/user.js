const sequelize = require("../data/db");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const User = sequelize.define("user", {
    userid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Ad Soyad girmelisiniz"
            },
            isFullname(value) {
                if(value.split(" ").length < 2) {
                    throw new Error("Lütfen ad ve soyad bilginizi giriniz");
                }
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "Bu email daha önce kullanılmış"
        },
        validate: {
            notEmpty: {
                msg: "Email girmelisiniz"
            },
            isEmail: {
                msg: "Hatalı email biçimi"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Parola boş geçilemez"
            },
        }
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    timestamps: true
});

User.beforeSave(async user => {
    if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

module.exports = User;