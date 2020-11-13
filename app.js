require('dotenv').config()
const fetch = require('node-fetch');
const Discord = require('discord.js');
const client = new Discord.Client();

const WELCOME_NEW_MEMBERS = false

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

		// TODO: if user status is confirmed, just say g'day & that you regret to inform them that there is nothing else you can do for them at this time
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

	    // email is valid
	    //msg.reply("Thanks!")

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

	  // testing
	  console.log(JSON.stringify(member));

	  member.send(`Hi, ${member}! I need to verify your identity to add you to the DxE SF Bay chapter member channels. What is your email address?`)
	  // set status for this user in memory to "pending email" until their email is provided
	});
}

client.login(process.env.DISCORD_TOKEN);