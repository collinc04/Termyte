const { Events } = require('discord.js');
const mongoose = require('mongoose');
const dbURL = process.env.database;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Logged in to Discord as ${client.user.tag} and online.`);

		//connect to the database
		if(dbURL) {
			await mongoose.connect(dbURL);
		}

		if(mongoose.connect){
			console.log('Logged in to mongodb atlas.');
		} else {
			console.log('Error logging in to mongodb atlas.');
		}
	},
};

//from discord.js