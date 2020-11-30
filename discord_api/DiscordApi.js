// Utility function to wrap results of network requestss
const result = async (fn) => {
    try {
        return { isSuccess: true, result: await fn() };
    } catch (error) {
        console.log(error);
        return { isSuccess: false, error };
    }
};

// try to add the role using the ID
// return true on success, false otherwise
const addRole = async (state, req, res, role) => {
    console.log("Adding " + role + " role to user " + req.body.user);
    const guild = await result(() => state.client.guilds.fetch(state.DISCORD_GUILD_ID));
    if (!guild.isSuccess) {
        return false;
    }
    const user = await result(() => guild.result.members.fetch(req.body.user));
    if (!user.isSuccess) {
        return false;
    }
    return (await result(() => user.result.roles.add(role))).isSuccess;
};

// try to remove the role using the ID
// return true on success, false otherwise
const removeRole = async (state, req, res, role) => {
    console.log("Removing " + role + " role from user " + req.body.user);
    const guild = await result(() => state.client.guilds.fetch(state.DISCORD_GUILD_ID));
    if (!guild.isSuccess) {
        return false;
    }
    const user = await result(() => guild.result.members.fetch(req.body.user));
    if (!user.isSuccess) {
        return false;
    }
    return (await result(() => user.result.roles.remove(role))).isSuccess;
};

module.exports = { addRole, removeRole };
