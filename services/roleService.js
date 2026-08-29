const User = require("../models/user");
const Role = require("../models/role");
const { NotFoundError, ForbiddenError } = require("../helpers/errors");

async function addRoleToUser(userid, roleid) {
    const user = await User.findByPk(userid);
    if (!user) {
        throw new NotFoundError("Kullanıcı bulunamadı.");
    }

    const role = await Role.findByPk(roleid);
    if (!role) {
        throw new NotFoundError("Rol bulunamadı.");
    }

    const existingRoles = await user.getRoles({ where: { roleid: role.roleid } });
    if (existingRoles.length > 0) {
        throw new ForbiddenError("Kullanıcı zaten bu role sahip.");
    }

    await user.addRole(role);

    return { user, role };
}

async function removeRoleFromUser(userid, roleid, currentUserId) {
    const user = await User.findByPk(userid);
    if (!user) {
        throw new NotFoundError("Kullanıcı bulunamadı.");
    }

    const role = await Role.findByPk(roleid);
    if (!role) {
        throw new NotFoundError("Rol bulunamadı.");
    }

    if (role.slug === "admin" && String(userid) === String(currentUserId)) {
        throw new ForbiddenError("Kendi admin rolünüzü kendinizden kaldıramazsınız.");
    }

    await user.removeRole(role);

    // İşlemi yapan kişi kendi rolünü değiştiriyorsa,
    // mevcut oturum/token'ları anında geçersiz kıl.
    if (String(userid) === String(currentUserId)) {
        await user.increment("tokenVersion");
    }

    return { user, role };
}

async function setUserRoles(userid, desiredRoleIds, currentUserId) {
    const user = await User.findByPk(userid, { include: Role });
    if (!user) {
        throw new NotFoundError("Kullanıcı bulunamadı.");
    }

    const currentRoleIds = user.roles.map(r => String(r.roleid));
    const desired = desiredRoleIds.map(id => String(id));

    const toAdd = desired.filter(id => !currentRoleIds.includes(id));
    const toRemove = currentRoleIds.filter(id => !desired.includes(id));

    // Önce kaldırılacakları işle — self-lockout koruması burada devreye giriyor,
    // biri denerse (frontend'i atlatarak bile) burada durdurulacak.
    for (const roleid of toRemove) {
        await removeRoleFromUser(userid, roleid, currentUserId);
    }

    for (const roleid of toAdd) {
        await addRoleToUser(userid, roleid);
    }

    return User.findByPk(userid, {
        attributes: ["userid", "fullname", "email"],
        include: { model: Role, attributes: ["roleid", "rolename"] }
    });
}

module.exports = { addRoleToUser, removeRoleFromUser, setUserRoles };