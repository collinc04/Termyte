const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    //create the structure for serverinfo command
	data: new SlashCommandBuilder().setName('serverinfo').setDescription('Provides information about a server.'),
	async execute(interaction) {

        //fetch info about the server
        const { guild } = interaction;
        const icon = guild.iconURL();
        //fetch info about the owner of the server
        const owner = await guild.fetchOwner();
        const ownerTag = owner.user;

        //create an embed
        const embed = new EmbedBuilder().setColor("Blue").setAuthor({name: guild.name, iconUrl: icon}).setThumbnail(icon)
        .addFields({name: "", value: `**owner:** ${ownerTag}`, inline: false})
        .addFields({name: "", value: `**member count:** ${guild.memberCount}`, inline: false})
        .addFields({name: "", value: `**text channels:** ${guild.channels.cache.filter(c => c.type === 0).size.toString()}`, inline: false})
        .addFields({name: "", value: `**voice channels:** ${guild.channels.cache.filter(c => c.type === 2).size.toString()}`, inline: false})
        .addFields({name: "", value: `**server created on:** ${guild.createdAt.toDateString()}`, inline: false})
        .addFields({name: "server roles: ", value: `${guild.roles.cache.map(r => r).join(' ')}`, inline: false})
        .setFooter({text: `server: ID ${guild.id}`})
        .setTimestamp()

		await interaction.reply({ embeds: [embed]});
	},
};