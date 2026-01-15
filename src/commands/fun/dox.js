const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    //create the structure for command
	data: new SlashCommandBuilder().setName('dox').setDescription('Doxes a user.').addUserOption(option => option.setName('user').setDescription('target user').setRequired(true)),
	async execute(interaction) {
        //generate fake IP address (code from quickref.me)
        const user = interaction.options.getUser('user')
        const fakeIp = () => Array(4).fill(0).map((_, i) => Math.floor(Math.random() * 255) + (i === 0 ? 1 : 0)).join('.');

        //reply
        await interaction.reply(`${user}'s IP address is ${fakeIp()}`);
	},
};