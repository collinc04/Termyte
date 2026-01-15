const { SlashCommandBuilder,EmbedBuilder,MessageFlags } = require('discord.js');

const axios = require('axios');
const tenorkey = process.env.tenor_token;
//requesting service
const client = "Discord_bot";
//1 gif
const limit = 1;
const url = "https://tenor.googleapis.com/v2/search";

module.exports = {
    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('gifroulette')
        .setDescription('replies with a random gif'),
    
    async execute(interaction) {
        
        //randomize a string because tenors api can't do fully random searches
        const charSet = 'abcdefghijklmnopqrstuvwxyz123456789?! *-><~éáèàêâñõüïaeiou:()'
        //get a length between 3 and 14 (functionally 15 because it will be rounded)
        let qlength = (Math.random() * 11) + 3;
        qlength = Math.round(qlength);
        let randString = '';
        let gifurl;

        //generate random from set of chars and random length
        for(let i = 0; i < qlength; i++) {
            randString += charSet.charAt(Math.floor(Math.random()*charSet.length))
        }

        try {
            const response = await axios.get(url, 
                { params: { 
                    q: `${randString}`,
                    key: tenorkey,
                    client_key: client,
                    limit: limit,
                    contentfilter: 'off', 
                    media_filter: 'gif',
                    random: true, 
                }});
            
            const data = response.data;

            if(data.results && data.results.length > 0) {
                const gif = data.results[0];
                gifurl = gif.media_formats.gif.url;
            }

            await interaction.reply(`${gifurl}`);
        } catch (error) {
            const err = new EmbedBuilder().setColor('Red').setDescription(`:x: Error in tenor query ${error}`)
            await interaction.reply( {embeds: [err], flags: MessageFlags.Ephemeral} );
        }
    },
};