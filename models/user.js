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
            notEmpty: { msg: "Ad Soyad girmelisiniz" },
            isFullname(value) {
                if (value.split(" ").length < 2) {
                    throw new Error("Lütfen ad ve soyad bilginizi giriniz");
                }
            }
        }
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: {
            args: true,
            msg: "Bu kullanıcı adı kullanılıyor"
        },
        validate: {
            len: { args: [3, 30], msg: "Kullanıcı adı 3-30 karakter arası olmalıdır" },
            is: {
                args: /^[a-z0-9_-]+$/,
                msg: "Kullanıcı adı sadece küçük harf, rakam, alt çizgi (_) ve tire (-) içerebilir"
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: true, msg: "Bu email daha önce kullanılmış" },
        validate: {
            notEmpty: { msg: "Email girmelisiniz" },
            isEmail: { msg: "Hatalı email biçimi" }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Parola boş geçilemez" }
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: { args: [0, 500], msg: "Biyografi en fazla 500 karakter olabilir" }
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    tokenVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

User.beforeValidate(user => {
    if (user.username) {
        user.username = user.username.toLowerCase();
    }
});

User.beforeSave(async user => {
    if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

module.exports = User;