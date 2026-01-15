const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    //create the structure for whois with a description and a field to input a target user
	data: new SlashCommandBuilder().setName('whois').setDescription('Provides information about a user.').addUserOption(option => option.setName('user').setDescription('target user').setRequired(false)),
	async execute(interaction) {

        //fetch info about target or user who ran command, get their avatar and their tag
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const icon = user.displayAvatarURL();
        const tag = user.tag;

        //create an embed
        const embed = new EmbedBuilder().setColor("Green").setAuthor({name: tag, iconUrl: icon}).setThumbnail(icon)
        .addFields({name: "", value: `**display name:** ${user}`, inline: false})
        .addFields({name: "", value: `**join date:** <t:${parseInt(member.joinedAt / 1000)}:R>`, inline: true})
        .addFields({name: "", value: `**account created:** <t:${parseInt(user.createdAt / 1000)}:R>`, inline: true})
        .addFields({name: "roles: ", value: `${member.roles.cache.map(r => r).join(' ')}`, inline: false})
        .setFooter({text: `user ID: ${user.id}`})
        .setTimestamp()

		await interaction.reply({ embeds: [embed]});
	},
};