const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const g_policies = require('../../schemas/g_policies.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('manage automod punishments and cooldowns for bot queries')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addBooleanOption(option => option.setName('punish-violations').setDescription('wether or not automod violations will be punished').setRequired(true))
    .addIntegerOption(option => option.setName('timeout-duration').setDescription('timeout duration in minutes').setRequired(false))
    .addIntegerOption(option => option.setName('commands-cooldown').setDescription('cooldown duration between bot queries').setRequired(false)),

    async execute(interaction) {
        const {options} = interaction;

        //retrieve cmd data
        const enforce = options.getBoolean('punish-violations');
        const magnitude = options.getInteger('timeout-duration');
        const cooldown = options.getInteger('commands-cooldown');
        const guildId = interaction.guildId;

        const response = new EmbedBuilder().setTitle('server automod and bot policies manager');
        //defer for db actions
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        try {
            let data = await g_policies.findOne({ Guild: guildId });
            
            //if a policy file does not yet exist
            if(!data){
                await g_policies.create({
                    Guild: guildId,
                    Enforcement: enforce || false,
                    EnforcementMagnitude: magnitude || 10,
                    CmdsCooldown: cooldown || 2
                });

                //respond
                response.setColor('Green');
                response.setDescription(`success! guild policy file was created`);
                await interaction.editReply({ embeds: [response], flags: MessageFlags.Ephemeral})
            } else {
                //dynamic updates
                const update = {Enforcement: enforce};

                if(magnitude !== null) update.EnforcementMagnitude = magnitude;
                if(cooldown !== null) update.CmdsCooldown = cooldown;

                const newData = await g_policies.findOneAndUpdate(
                    { Guild: guildId}, //using this to find the file, removing it would be a rookie mistake that I wouldn't make. Obviously
                    { $set: update},
                    { upsert: true, new: true, setDefaultsOnInsert: true}
                );

                //respond
                response.setColor('Green');
                response.setDescription(`success! guild policy file was updated`);
                await interaction.editReply({ embeds: [response], flags: MessageFlags.Ephemeral})
            }

            //fetch after update or file creation
            data = await g_policies.findOne({ Guild: guildId });
            const updateMbed = new EmbedBuilder().setColor('Green').setTitle('Current guild policies:')
            .setDescription(`Enforce filter violations: ${data.Enforcement}
                \n Timeout duration: ${data.EnforcementMagnitude} minutes
                \n Slash command cooldown: ${data.CmdsCooldown} seconds`);
            interaction.followUp({embeds: [updateMbed], flags: MessageFlags.Ephemeral});
        } catch (error) {
            response.setColor('Red');
            response.setDescription(`:x: ${error}`);
            await interaction.editReply({ embeds: [response], flags: MessageFlags.Ephemeral})
        }
    }
}