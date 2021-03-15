require('dotenv').config()
const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();
const express = require('express')
const app = express()
app.use(express.json());
const port = process.env.PORT

const appApi = require('./app_api/AppApi');
const discordApi = require('./discord_api/DiscordApi');

const WELCOME_NEW_MEMBERS = true
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID

// Store state in a single variable for convenient dependency injection in tests
const state = {
	DISCORD_GUILD_ID,
	client,
	discordApi,
};

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

	if (msg.author.bot) return // don't reply to bots (i.e. yourself)

	if (msg.content.startsWith("!users")) {
		console.log("!users command called")

		// fetch all users
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
		.then(guild => {
			guild.members.fetch()
			.then(users => {
				let allUsers = new Map()
				users.forEach((value, key) => {
					allUsers[key] = {
						"username": value.user.username,
						"adb": null,
					}
				})
				// get users from ADB
				const paramsForStatus = new URLSearchParams();
				paramsForStatus.append('auth', process.env.ADB_SECRET);

				fetch('https://adb.dxe.io/discord/list', {method: 'POST', body: paramsForStatus})
				.then( res => {
					return res.json()
				})
				.then( json => {
					json.activists.forEach(activist => {
						// add to allUsers where key matches ID
						if (allUsers[activist.DiscordID]) allUsers[activist.DiscordID].adb = activist.Name
					})
					// TODO: make this output prettier & handle message length > 2000 chars
					let newMessage = "These users do not have their Discord ID in the ADB:\n\nDiscord ID" + "\t\t" + "Discord username\n";
					for (const [key, value] of Object.entries(allUsers)) {
						if (!value.adb) newMessage += key + "\t" + value.username + "\n";
					}
					msg.reply(newMessage)
				})
			})
			.catch(err => {
				res.status(500);
				return res.json({"result": "error"});
			})
	})

	// request list of users from ADB to compare to
	return
	}

	if (msg.content.startsWith("!events")) {
		msg.reply("Event functionality is coming soon.")
		return
	}

	if (msg.content.startsWith("!set")) {
		console.log("!set command called")
		const moderatorRoleId = "748440668850094141"
		let isModerator = false;
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
			.then(guild => {
				guild.members.fetch(msg.author)
					.then(user => {
						roles = user._roles
						// get names of roles that the user has
						roles.forEach(role => {
							if (role === moderatorRoleId) {
								isModerator = true
							}
						})
						if (!isModerator) {
							msg.reply("Sorry, only moderators may use this command.")
							return
						}
						const key = msg.content.substring(5).split(" ")[0].toLowerCase()
						const value = msg.content.substring(msg.content.indexOf(" ", 5) + 1)
						if (key === "users" || key === "events") {
							msg.reply("Sorry, that is a reserved word.")
							return
						}
						if (!/^[a-zA-Z]+$/.test(key)) {
							msg.reply("Sorry, the word must only contain letters.")
							return
						}
						if (key.length > 2000) {
							msg.reply("Sorry, the message length must be <= 2000 characters.")
							return
						}
						const params = new URLSearchParams();
						params.append('auth', process.env.ADB_SECRET);
						params.append('user', msg.author.id)
						params.append('text', value)
						console.log("params:" + params.toString())
						fetch('https://adb.dxe.io/discord/set_message/' + key, {method: 'POST', body: params})
							.then( res => { return res.json() } )
							.then( json => {
								msg.reply(json.status)
							})
					})
			})

		return
	}

	if (msg.content.startsWith("!")) {
		console.log("! command called")
		const chapterMemberRoleID = "748440285410754601"
		let isChapterMember = false;
		client.guilds.fetch(process.env.DISCORD_GUILD_ID)
			.then(guild => {
				guild.members.fetch(msg.author)
					.then(user => {
						roles = user._roles
						// get names of roles that the user has
						roles.forEach(role => {
							if (role === chapterMemberRoleID) {
								isChapterMember = true
							}
						})
						if (!isChapterMember) {
							// don't say anything if error since they may be calling a different bot
							return
						}
						const key = msg.content.substring(1).toLowerCase()
						if (!/^[a-zA-Z]+$/.test(key)) {
							return
						}
						const params = new URLSearchParams();
						params.append('auth', process.env.ADB_SECRET);

						fetch('https://adb.dxe.io/discord/get_message/' + key, {method: 'POST', body: params})
							.then( res => { return res.json() } )
							.then( json => {
								let status = json.status
								let message = json.message
								if (status === 'success') {
									msg.reply(message)
									return
								}
							})
					})
			})
		return
	}

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

				if (status === 'too many activists') {
					msg.reply("Sorry, there are multiple activists associated with that email address. Please email tech@dxe.io for assistance.")
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
	  const channel = member.guild.channels.cache.find(ch => ch.name === '🔑verify');
	  channel.send(`Welcome, ${member}! If you are already a member of DxE, please verify your identity by replying to the direct message sent by <@768973756411674644>. (If you have any trouble, please email discord-mods@dxe.io.)`);

	  // logging for now to make sure everything goes okay
	  console.log("New member joined the server:")
	  console.log(JSON.stringify(member));

	  member.send(`Hi, ${member}! If you are already a member of DxE SF Bay, I need to verify your identity to add you to the exclusive channels. What is your email address?`)
	});
}

client.login(process.env.DISCORD_TOKEN);

function getUserRoles() {}

app.get('/roles/get', (req, res) => {

	// TODO: check that request is authorized with our ADB/bot shared secret
	// (not super important b/c it is only accessible internally on server itself)

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
				.catch(err => {
					res.status(500);
					return res.json({"result": "error"});
				})
			})

		})
	})

})

app.post('/roles/add', appApi.addRole(state))

app.post('/roles/remove', appApi.removeRole(state))

app.post('/send_message', async (req, res) => {
	let recipient = req.body.recipient
	let message = req.body.message
	const msgCharLimit = 1950

	if (typeof(recipient) == 'undefined' || recipient.length == 0) {
		res.status(400);
		return res.json({"result": "error: no recipient provided"});
	}
	if (typeof(message) == 'undefined' || message.length == 0) {
		res.status(400);
		return res.json({"result": "error: no message provided"});
	}

	client.guilds.fetch(process.env.DISCORD_GUILD_ID)
	.then(guild => {
		guild.members.fetch(recipient)
		.then(recipient => {
			for(let i = 0; i < message.length; i += msgCharLimit) {
			    const msgToSend = message.substring(i, Math.min(message.length, i + msgCharLimit));
			    recipient.send(msgToSend)
			}
		})
		.then(result => {
			return res.json({"result": "sent"});
		})
		.catch(err => {
			res.status(500);
			return res.json({"result": "error"});
		})	
	})
})

app.post('/update_nickname', (req, res) => {

	// note that this will not work if the user is a moderator

	let user = req.body.user
	let name = req.body.name

	console.log("Updating nickname of " + user + " to " + name);

	if (typeof(user) == 'undefined' || user.length == 0) {
		res.status(400);
		return res.json({"result": "error: no user provided"});
	}
	if (typeof(name) == 'undefined' || name.length == 0) {
		res.status(400);
		return res.json({"result": "error: no name provided"});
	}

	client.guilds.fetch(process.env.DISCORD_GUILD_ID)
	.then(guild => {
		guild.members.fetch(user)
		.then(user => {
			user.setNickname(name)
			.then(result => {
				return res.json({"result": "updated"});
			})
			.catch(err => {
				res.status(500);
				return res.json({"result": "error: " + err.message});
			})		
		})
	})
})


app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})
