const Role = require("../models/role");

async function seedRoles() {
    const roles = ["user", "moderator", "admin"];

    for (const rolename of roles) {
        await Role.findOrCreate({
            where: { rolename }
        });
    }
}

module.exports = seedRoles;