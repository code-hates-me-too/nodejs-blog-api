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
        allowNull: false,
        unique: {
            args: true,
            msg: "Bu rol adı veya uzantısı mevcut. Lütfen değişiklik yapın"
        },
        validate: {
            notEmpty: {
                args: true,
                msg: "Rol adı boş geçilemez."
            },
            len: {
                args: [1, 25],
                msg: "Rol ismi en fazla 25 karakter olabilir "
            }
        }
    },
    
}, {
    timestamps: false,
    freezeTableName: true
}
);

module.exports = Role;