const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    //create the structure for retrieval of the version from configs
	data: new SlashCommandBuilder().setName('version').setDescription('bot current version'),
	async execute(interaction) {
        const version = process.env.version;
        //for custom bots built off the source
        const name = process.env.bot_name;

        //version embed
        const embed = new EmbedBuilder().setColor("Yellow").addFields({name: "", value: `${name} is on version ${version}!`, inline: true})

        //send version as embed
        await interaction.reply( {embeds: [embed], flags: MessageFlags.Ephemeral} );
	},
};