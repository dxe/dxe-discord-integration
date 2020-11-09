require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();

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

    // TODO: get status of user id & email in ADB

    // TODO: if user status is confirmed, just say g'day & that you regret to inform them that there is nothing else you can do for them at this time

     // confirm email is valid
    if (!validateEmail(msg.content)) {
      msg.reply("Sorry, that is not a valid email address.")
      msg.reply("I need to verify your identity to add you to the DxE SF Bay chapter member channels. What is your email address?");
      return
    }
    userEmail = msg.content

    // if user ID for this email is pending, inform them of the same.
    
    // if user ID is pending but a different email is provided, continue to checking for validity, then send a new confirmation email

    // email is valid
    msg.reply("Thanks! Give me a moment to check on that.")
    // TODO: if email address is in the ADB, then send a verification email & instructions (make sure to tell to check spam folder)
    // TODO: if email provided is not in the ADB, send an error message
  }

});

// event listener for new guild members
client.on('guildMemberAdd', member => {
  console.log("guild member added.");
  const channel = member.guild.channels.cache.find(ch => ch.name === '💬general');
  channel.send(`Welcome to the DxE Discord, ${member}! Please check your direct messages for instructions to join more channels.`);

  // testing
  console.log(JSON.stringify(member));

  member.send(`Hi, ${member}! I need to verify your identity to add you to the DxE SF Bay chapter member channels. What is your email address?`)
  // set status for this user in memory to "pending email" until their email is provided
});

client.login(process.env.DISCORD_TOKEN);