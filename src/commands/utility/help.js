const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    //call the help embed
    data: new SlashCommandBuilder().setName('help').setDescription('list commands and their uses'),
    async execute(interaction) {
        const { client } = interaction;
        //slang for commands 
        const cmds = client.commands;
        const help = new EmbedBuilder()

        try {
            //create an embed
            help.setColor("Yellow")
            .setTitle('Commands:');

            if(cmds.size === 0) throw new Error('no commands could be found');

            //suboptions
            for(const cmd of cmds.values()) {
                let options = 'none';
                if(cmd.data.options && cmd.data.options.length > 0) {
                    options = cmd.data.options.map(option => {
                        return `${option.name}/${option.description}`;
                    }).join('\n');
                }

                //add all
                help.addFields({
                    name: `/${cmd.data.name} Description: ${cmd.data.description}`,
                    value: `-# sub options: \n ${options}`,
                    inline: false,
                });
            }
        } catch (error) {
            help.setColor("Red")
            .setDescription(`:x: ${error}`);
        }

        await interaction.reply({ embeds: [help], flags: MessageFlags.Ephemeral});
    },
};