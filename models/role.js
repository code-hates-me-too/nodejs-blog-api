const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Role = sequelize.define("role", {
    roleid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    rolename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
}, {
    timestamps: false,
    freezeTableName: true
}
);

module.exports = Role;