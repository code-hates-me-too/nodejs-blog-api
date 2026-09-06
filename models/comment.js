const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Comment = sequelize.define("comment", {
    commentid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    icerik: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Yorum boş olamaz." },
            len: { args: [1, 1000], msg: "Yorum en fazla 1000 karakter olabilir." }
        }
    },
    derinlik: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    onay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = Comment;