const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Notification = sequelize.define("notification", {
    notificationid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    mesaj: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = Notification;