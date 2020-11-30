const addRole = (state) => async (req, res) => {
	let role = req.body.role;

	// if role is not a number, see if you can find a role with that name
	if (isNaN(role)) {
		// try look up the id using the name
		const guild = await state.client.guilds.fetch(state.DISCORD_GUILD_ID)
		const roles = await guild.roles.fetch();
		const allRoles = new Map();
		roles.cache.forEach(role => {
			allRoles[role.name] = role.id;
		})
		role = allRoles[role];
		if (role === undefined) {
			res.status(400);
			return res.json({"result": "role not found"});
		}
	}
	if (await state.discordApi.addRole(state, req, res, role)) {
		return res.json({"result": "added"});
	} else {
		res.status(500);
		return res.json({"result": "error"});
	}
};

const removeRole = (state) => async (req, res) => {
	let role = req.body.role;

	// if role is not a number, see if you can find a role with that name
	if (isNaN(role)) {
		// try look up the id using the name
		const guild = await state.client.guilds.fetch(state.DISCORD_GUILD_ID)
		const roles = await guild.roles.fetch();
		let allRoles = new Map();
		roles.cache.forEach(role => {
			allRoles[role.name] = role.id;
		})
		role = allRoles[role];
		if (role === undefined) {
			res.status(400);
			return res.json({"result": "role not found"});
		}
	}
	if (await state.discordApi.removeRole(state, req, res, role)) {
		return res.json({"result": "removed"});
	} else {
		res.status(500);
		return res.json({"result": "error"});
	}
};

module.exports = { addRole, removeRole };
