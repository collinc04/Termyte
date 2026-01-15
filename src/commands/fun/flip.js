const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // Define the slash command data
    data: new SlashCommandBuilder().setName('flip').setDescription('heads or tails. "Live by the coin, die by the coin..." -unknown'),
    
    async execute(interaction) {
        //coin flip
        const heads = Math.random() < 0.5; //50/50
        let msg = "";

        //create the message to put in embed
        if(heads){
            msg = "heads!";
        } else {
            msg = "tails!";
        }

        //create and send an embed
        const embed = new EmbedBuilder().setColor("Purple").addFields({name: "", value: `a coin was flipped and it landed on ${msg}`, inline: true})
        await interaction.reply({ embeds: [embed]});
    },
};