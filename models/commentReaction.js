const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const CommentReaction = sequelize.define("commentReaction", {
    reactionid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tur: {
        type: DataTypes.ENUM("begeni", "begenmeme"),
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
        { unique: true, fields: ["commentid", "userid"] }
    ]
});

module.exports = CommentReaction;