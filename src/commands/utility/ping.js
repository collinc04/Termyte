const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Can add cooldown here logic is Cooldown: X,
    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot latency'),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const reply = await interaction.fetchReply();
        //subtract timestamp of command from timestamp of bot's
        const latency = reply.createdTimestamp - interaction.createdTimestamp;

        //creat an embedded object to display ping
        const embed = new EmbedBuilder().setColor("Yellow").addFields({name: "", value: `**Pong: ** ${latency}ms`, inline: true}).setTimestamp()

        //send a message with ping time in ms
        await interaction.editReply( {embeds: [embed]} );
    },
};