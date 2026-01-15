const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('bulk deletes messages in a channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addIntegerOption(option => option.setName('quantity').setDescription('number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
    
    async execute(interaction) {

        //creat an embedded object to display the info
        const response = new EmbedBuilder().setColor("Blue").setTitle('Purge:').setTimestamp()
        const quantity = interaction.options.getInteger('quantity');

        try {
            const toDelete = await interaction.channel.bulkDelete(quantity, true);
            response.setDescription(`:white_check_mark: ${quantity} messages were purged from this channel`);
        } catch (error) {
            response.setDescription(`:x: failed to purge ${quantity} messages. ${error}`);
        }

        //send announcement
        await interaction.reply( {embeds: [response], flags: MessageFlags.Ephemeral} );
    },
};