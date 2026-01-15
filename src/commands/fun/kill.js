const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const iconPath = path.join(__dirname, '..', '..', 'assets', 'SlashKillGag.gif'); //icon location 
const gif = new AttachmentBuilder(iconPath, { name: 'SlashKillGag.gif' });

module.exports = {
    //create the structure for command
	data: new SlashCommandBuilder().setName('kill').setDescription('Deals with a user.').addUserOption(option => option.setName('user').setDescription('target user').setRequired(true)),
	async execute(interaction) {
        const user = interaction.options.getUser('user')

        //reply
        await interaction.reply({content: `${user}`, files: [gif]});
	},
};