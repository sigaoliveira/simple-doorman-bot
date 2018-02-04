// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'lounge');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to SNOWSZ alliances, ${member}! In order to have access to all channels, you must use the following command +freeze Your Nickname (as it is in the game; for example: \n +freeze Jon Snow)`);
});

// Create an event listener for removed guild members
client.on('guildMemberRemove', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'lounge');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`I have a tender spot in my heart for cripples, bastards and broken things, still ${member} decided to leave`);
});

client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "invite") {
    // makes the bot share its own invitation URL 
    message.reply("thanks for your interest! Please find below my invitation link (spread the word! :)):");
    message.channel.send("https://discordapp.com/oauth2/authorize?client_id=407721409759019008&permissions=8&scope=bot");
	}
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention!
    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the kick!");
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({count: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
  
  if(command === "whois") {
    // Testing some user catchable data - with errors >>> need to fix
	let member = message.mentions.members.first();
	if(!member)
	  return message.reply("Please mention a valid member of this server");
	//let mentionTag = message.server.roles.get('name', 'everyone');
	message.reply("Scanning....");
    message.channel.send(`User ID#: ${member.id} | Nickname: ${member.nickname} | \n Username: ${member.user.username}`)
    // message.channel.send(`User ID#: ${member.id} \n Nickname: ${member.nickname} \n Username: ${member.user.username} ${mentionTag}`)
  }
  
	if(command === "nick") {
		let member = message.mentions.members.first();
		if(!member)
		  return message.reply("Please mention a valid member of this server");
		
		// slice(1) removes the first part, which here should be the user mention!
		let newNick = args.slice(1).join(' ');
		if(!newNick)
		  return message.reply("Please indicate the new nickname for the user");
		
		// Now, time for a swift kick in the nuts!
		await member.setNickname(newNick)
		  .catch(error => message.reply(`Sorry ${message.author} I couldn't change the nickname because of : ${error}`));
		message.reply("Nickname change successfully completed")
	}
	
  if(command === "freeze") {
    // Update users' nick and ask needed questions for credentials verification purposes 
    const newNick = args.join(" ");
	const member = message.author;
	const channel = message.guild.channels.find("name", "checkpoint")
	let mentionTag = message.server.roles.get('name', 'Administrator')
	
	if(!newNick)
		return message.reply("Error: missing argument - please repeat the command adding your in game nickname");
		
	// Update user nick and send message about it
	await member.setNickname(newNick)
		.catch(error => message.reply(`Sorry ${message.author} I couldn't change your nickname because of : ${error}`));
	message.channel.send(`Hello ${message.author}, we’ve updated your nick to reflect the one you use in the game (don’t worry: it will not change your nickname in other servers). You are not allowed to type on #lounge anymore. \n We need some info from you to grant you all due permissions: \n 1. Are you already using your in game nickname? (everyone in this server should be using the same nick as it is on the game. If yours is still different, please tell us what it is) \n \n 2. Are you SNOWS or SNOWZ? \n \n 3. Who is your direct liege? (you are bannerman of whom?) \n \n ${mentionTag}`);
  }	
	
});

client.login(config.token);