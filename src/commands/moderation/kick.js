const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('kicks a user from the server.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => option.setName('target').setDescription('target user').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('reason for kick').setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const targetName = interaction.options.getUser('target').username;
        const reason = interaction.options.getString('reason') || 'member was kicked';

        try {

            if(!target.kickable) {
                throw new Error(`can't kick target`)
            }

            await target.kick(reason);

            //creat an embedded object to display an announcement
            const announcement = new EmbedBuilder().setColor("Red").addFields({name: "Kicked user:", value: `:boot: kicked ${targetName}`, inline: true}).setTimestamp()

            //send announcement
            await interaction.reply( {embeds: [announcement]} );
        } catch (error) {
            //creat an embedded object to display an announcement
            const failure = new EmbedBuilder().setColor("Red").addFields({name: `could not kick ${targetName}`, value: `${error}`, inline: true}).setTimestamp()

            //send announcement
            await interaction.reply( {embeds: [failure], flags: MessageFlags.Ephemeral} );
        }
    },
};