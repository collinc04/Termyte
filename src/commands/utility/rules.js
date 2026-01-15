const { SlashCommandBuilder, MessageFlags, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const g_policies = require('../../schemas/g_policies.js');

module.exports = {
    // Can add cooldown here logic is Cooldown: X,
    // Define the slash command data
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('lists current server automod rules'),
    
    async execute(interaction) {
        const { guild } = interaction;
        const user = interaction.member;
        let embedColor;
        let statusMsg;
        const status = new EmbedBuilder;
        const guildId = interaction.guild.id;
        //defer for db actions
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {
            const rules = await guild.autoModerationRules.fetch(); //get the list of active rules
            if(rules.size === 0){throw new Error('No rules found')}
            const activeRules = rules.filter(rule => rule.enabled === true);
            if(activeRules.size === 0){throw new Error('No active rules found')}
            embedColor = "Blue";
            statusMsg = `${guild.name}'s current active rules:`;
            keywordFlag = false;

            //loop through
            activeRules.forEach(rule => {
                //display snowflakes for admins but not for regular users (For use with Automod sub functions)
                if(!user.permissions.has(PermissionFlagsBits.Administrator)) {
                    //display anonymized, abridged rules for security
                    switch (rule.triggerType) {
                        case 1: //keyword
                            if(!keywordFlag) {
                                status.addFields({name: `- Custom word filter`, value: ``})
                                keywordFlag = true; 
                            } //only show once
                            break;

                        case 3: //spam
                            status.addFields({name: `- Spam filter`, value: ``})
                            break;

                        case 4: //Default filter
                            status.addFields({name: `- Inapropriate langauge filter`, value: ``})
                            break;

                        case 5: //Mention spam
                            status.addFields({name: `- Mention spam filter`, value: ``})
                            break;
                    }
                } else {
                    status.addFields({name: "", value: `- ${rule.name},`, inline: true})
                    status.addFields({name: "", value: `-# ID: ${rule.id}`, inline: true})
                    status.addFields({name: "", value: ``, inline: false})
                }
            });
        } catch(error) {    
            embedColor = "Red";
            statusMsg = `:cross_mark: failed to retrieve rules list ${error}`;
        }

        //retrieve policy file
        const data = await g_policies.findOne({ Guild: guildId });
        let mag;
        if(!data) {
            mag = 10;
        } else {
            mag = data.EnforcementMagnitude;
        }

        status.setColor(embedColor);
        status.setDescription(statusMsg);
        status.setFooter({ text: `violation of rules will result in a ${mag} minute penalty`});

        await interaction.editReply({ embeds: [status], flags: MessageFlags.Ephemeral });
    },
};