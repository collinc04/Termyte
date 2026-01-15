const { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const path = require('path');
const iconPath = path.join(__dirname, '..', '..', 'assets', 'Github logo.png'); //icon location 
const githubIcon = new AttachmentBuilder(iconPath, { name: 'github.png' });

//fetch function
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    //create the structure for retrieval query
	data: new SlashCommandBuilder().setName('gitrepo').setDescription('fetches a github repository and sends it to the chat').addStringOption(option => option.setName('repo').setDescription('account name/repo').setRequired(true)),
	async execute(interaction) {    
        const repo = interaction.options.getString('repo');
        const user = interaction.user.username;
        const regex = /^[\w-]+\/[\w.-]+$/;

        //Repo embed
        const embed = new EmbedBuilder().setColor("Green").addFields({name: `repo requested by ${user}`, value: ``, inline: false}).setThumbnail('attachment://github.png')

        try {

            if(!regex.test(repo)) {
                throw new Error(`Incorrect formatting use [owner/repo]`)
            }

            const readmeurl = `https://api.github.com/repos/${repo}/readme`;

            const data = await fetch(readmeurl, {headers: {
                'Accept': 'application/vnd.github.raw+json',
                'User-Agent': 'DiscordBot'
            }} );

            //check if readme exists
            if (!data.ok) {
                throw new Error('README not found');
            } else {
                let readme = await data.text();
                //cap at 2000 because who wants to read more than that in discord? and we are limited to 4k by api
                if(readme.length > 2000) {readme = readme.slice(0,2000) + '...'}
                embed.setDescription(`${readme}`);
            }

            const url = `https://github.com/${repo}`;
            embed.setTitle(`${repo}`);
            embed.setURL(url);

            //send Repo as embed
            await interaction.reply( {embeds: [embed], files: [githubIcon]} );
        } catch(error) {
            embed.addFields({name: ":x:", value: `${error}`, inline: true});
            //ephemeral if err
            await interaction.reply( {embeds: [embed], flags: MessageFlags.Ephemeral, files: [githubIcon]} );
        }
	},
};