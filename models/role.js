const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");
const slugField = require("../helpers/slugfield");

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
    slug: {
        type: DataTypes.STRING,
        allowNull: false,

        unique: {
            name: "unique_role_slug",
            msg: "Bu isme benzer bir rol zaten mevcut."
        },

        validate: {
            notEmpty: {
                msg: "Rol uzantısı boş geçilemez."
            },

            len: {
                args: [1, 25],
                msg: "Rol uzantısı en fazla 25 karakter olabilir."
            },

            is: {
                args: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                msg: "Rol uzantısı sadece küçük harf, rakam ve tire içerebilir."
            }
        }
    }
    
}, {
    timestamps: false,
    freezeTableName: true
}
);

Role.beforeValidate((role, options) => {
    if (role.changed("rolename") || role.isNewRecord) {
        role.slug = slugField(role.rolename);

        if (options.fields && !options.fields.includes("slug")) {
            options.fields.push("slug");
        }
    }
});

module.exports = Role;