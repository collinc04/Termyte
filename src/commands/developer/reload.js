const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),
	async execute(interaction) {

		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);
        
        try {
            //so that the catch can handle No cmd found and display a pop up so it looks nie
            if (!command) {
                throw new Error(`No command found with name /${commandName}`)
            }

            //go up a folder to the commands directory
            const commandsPath = path.join(__dirname, '..');
            const subFolders = fs.readdirSync(commandsPath);
            let curr = ''; //current folder

            //loop through subfolders (fun, utility, moderation) or others in the \commands dir. feel free to add more :)
            for(const folder of subFolders) {
                const currPath = path.join(commandsPath, folder);
                if (!fs.statSync(currPath).isDirectory()) continue;

                const files = fs.readdirSync(currPath);
                if (files.includes(`${command.data.name}.js`)) {
                    curr = folder;
                    break;
                }
            }

            const filePath = path.join(commandsPath, curr, `${command.data.name}.js`);
            delete require.cache[require.resolve(filePath)];

            const newCommand = require(filePath);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            //success pop up
            const success = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`:white_check_mark: Reloaded /${newCommand.data.name} successfully.`)

            await interaction.reply({
                embeds: [success], 
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error(error);
            //failure pop up
            const failure = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`:cross_mark: There was an error reloading /${commandName}: ${error.message}.`)
            
            //handle two error messages by using follow up to avoid non-descriptive error msg
            if(interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [failure],
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    embeds: [failure],
                    flags: MessageFlags.Ephemeral
                });
            }
        }
	},
};