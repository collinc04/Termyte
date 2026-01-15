const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

//fetch function
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder().setName('urbandict').setDescription('gets an urban dictionary definition').addStringOption(option => option.setName('word').setDescription('word to define').setRequired(true)),
    async execute(interaction) {    
        const word = interaction.options.getString('word');
        const endpoint = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`;

        //definition embed
        const embed = new EmbedBuilder().setColor("Blue").setTitle(`${word} is defined as follows:`)

        try {
            if(word.length > 30) { throw new Error(`there's literally no way that's a real word. I'm not searching that for you`)}

            const response = await fetch(endpoint);

            //throw an error
            if(!response.ok) {
                throw new Error(`HTTPS Error! ${response.status}`)
            }
            //capture response data
            const data = await response.json();
            const defs = data.list;

            //defs is slang for definitions in case u didn't know
            if(defs && defs.length > 0) {
                const def = defs[0]; 
                embed.setDescription(def.definition);
                if(def.example && def.example.trim().length > 0){
                    //enforce formatting so it doesn't break. Yes I copied the regex
                    embed.setFooter({ text: def.example.replace(/[\[\]]/g, '') });
                }
            } else {
                embed.setDescription('No definition found :(');
            }

            await interaction.reply( {embeds: [embed]} );
        } catch(error) {
            //catch error and display on embed
            embed.addFields({name: ":x:", value: `${error}`, inline: true});
            await interaction.reply( {embeds: [embed], flags: MessageFlags.Ephemeral} );
        }
    },
};