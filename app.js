require('dotenv').config()
const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const express = require('express')
const app = express()
const port = process.env.PORT

const WELCOME_NEW_MEMBERS = true

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  if (msg.author.bot) return // don't reply to bots (i.e. yourself)

  // reply if message sent directly to you
  if (msg.channel.type === "dm") {

	  // get the user's ID
	  userDiscordID = msg.author.id
	  console.log(userDiscordID);

	  // get status of user id in ADB
	  const paramsForStatus = new URLSearchParams();
		paramsForStatus.append('auth', process.env.ADB_SECRET);
		paramsForStatus.append('id', userDiscordID);

  	fetch('https://adb.dxe.io/discord/status', {method: 'POST', body: paramsForStatus})
		.then( res => { return res.json() } )
		.then( json => {
			status = json.status

			// if user status is confirmed, just say g'day & that you regret to inform them that there is nothing else you can do for them at this time
	    if (status == 'confirmed') {
	    	msg.reply("Your identify has been confirmed. There's nothing else that I can do for you at this time. Have a good day!")
	    	return
	    }

	    // if pending, then tell them that they may enter another email address if they'd like
	    if (status == 'pending' && !validateEmail(msg.content)) {
	    	msg.reply("I've already sent you an email to confirm your identity, but I can send another if you enter your email address again.")
	    	return
	    }

	    // confirm email is valid
	    if (!validateEmail(msg.content)) {
	      msg.reply("Sorry, that is not a valid email address.")
	      msg.reply("I need to verify your identity to add you to the DxE SF Bay chapter member channels. What is your email address?");
	      return
	    }
	    userEmail = msg.content    

	    // make "generate" request to ADB - it will return "invalid email" if not found or "success" if email belongs to an activist
	    const paramsForGenerate = new URLSearchParams();
			paramsForGenerate.append('auth', process.env.ADB_SECRET);
			paramsForGenerate.append('id', userDiscordID);
			paramsForGenerate.append('email', userEmail);

			fetch('https://adb.dxe.io/discord/generate', {method: 'POST', body: paramsForGenerate})
			.then( res => { return res.json() } )
			.then( json => {
				status = json.status

				if (status === 'invalid email') {
					msg.reply("Sorry, I could not find any activists associated with that email address. Please enter another email address to check, or email tech@dxe.io for assistance.")
					return
				}

				if (status === 'success') {
					msg.reply("I just sent an email to you to confirm your email address. Please click the confirmation link in the email. If you can't find it, then be sure to check your spam folder.")
					return
				}

			})

		})

  }

});

// event listener for new guild members
if (WELCOME_NEW_MEMBERS) {
	client.on('guildMemberAdd', member => {
	  console.log("guild member added.");
	  const channel = member.guild.channels.cache.find(ch => ch.name === '💬general');
	  channel.send(`Welcome to the DxE Discord, ${member}! Please check your direct messages for instructions to join more channels.`);

	  // logging for now to make sure everything goes okay
	  console.log("New member joined the server:")
	  console.log(JSON.stringify(member));

	  member.send(`Hi, ${member}! I need to verify your identity to add you to the DxE SF Bay chapter member channels. What is your email address?`)
	});
}

client.login(process.env.DISCORD_TOKEN);

app.get('/roles/get', (req, res) => {

	// TODO: check that request is authorized with our ADB/bot shared secret

	// fetch the guild's roles so that we know the names
	client.guilds.fetch(process.env.DISCORD_GUILD_ID)
	.then(guild => {
		guild.roles.fetch()
		.then(roles => {
			let allRoles = new Map()
			roles.cache.forEach(role => {
				allRoles[role.id] = role.name
			})

			// fetch the user's roles
			client.guilds.fetch(process.env.DISCORD_GUILD_ID)
			.then(guild => {
				guild.members.fetch(req.query.user)
				.then(user => {
					roles = user._roles
					// get names of roles that the user has
					let userRoles = new Map()
					roles.forEach(role => {
						userRoles[role] = allRoles[role]
					})
					res.json(userRoles);
				})
			})

		})
	})

})

app.post('/roles/add', (req, res) => {
	let role = req.query.role

	// if role is not a number, see if you can find a role with that name
	if (isNaN(role)) {
		// try look up the id using the name
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
		.then(guild => {
			guild.roles.fetch()
			.then(roles => {
				let allRoles = new Map()
				roles.cache.forEach(role => {
					allRoles[role.name] = role.id
				})
				role = allRoles[role]
				if (role === undefined) return res.json({"result": "role not found"});
				
				// try to add the role using the ID - TODO: move this to its own function to be reusable (or just use async/await to control flow better)
				console.log("Adding " + role + " role to user " + req.query.user)
				client.guilds.fetch(process.env.DISCORD_GUILD_ID)
				.then(guild => {
					guild.members.fetch(req.query.user)
					.then(user => {
						user.roles.add(role)
						// TODO: make sure we were successful
						res.json({"result": "added"});
					})
				})

			})
		})
	} else {

		// try to add the role using the ID - TODO: move this to its own function to be reusable (or just use async/await to control flow better)
		console.log("Adding " + role + " role to user " + req.query.user)
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
		.then(guild => {
			guild.members.fetch(req.query.user)
			.then(user => {
				user.roles.add(role)
				// TODO: make sure we were successful
				res.json({"result": "added"});
			})
		})

	}

})

app.post('/roles/remove', (req, res) => {
	let role = req.query.role

	// if role is not a number, see if you can find a role with that name
	if (isNaN(role)) {
		// try look up the id using the name
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
		.then(guild => {
			guild.roles.fetch()
			.then(roles => {
				let allRoles = new Map()
				roles.cache.forEach(role => {
					allRoles[role.name] = role.id
				})
				role = allRoles[role]
				if (role === undefined) return res.json({"result": "role not found"});
				
				// try to add the role using the ID - TODO: move this to its own function to be reusable (or just use async/await to control flow better)
				console.log("Removing " + role + " role from user " + req.query.user)
				client.guilds.fetch(process.env.DISCORD_GUILD_ID)
				.then(guild => {
					guild.members.fetch(req.query.user)
					.then(user => {
						user.roles.remove(role)
						// TODO: make sure we were successful
						res.json({"result": "removed"});
					})
				})

			})
		})
	} else {

		// try to add the role using the ID - TODO: move this to its own function to be reusable (or just use async/await to control flow better)
		console.log("Removing " + role + " role from user " + req.query.user)
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
		.then(guild => {
			guild.members.fetch(req.query.user)
			.then(user => {
				user.roles.remove(role)
				// TODO: make sure we were successful
				res.json({"result": "removed"});
			})
		})

	}

})

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})