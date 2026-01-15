const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, AutoModerationRuleTriggerType, AutoModerationRuleEventType, AutoModerationActionType, MessageFlags } = require('discord.js');

module.exports = {
    //data
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('sets automod rules')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(command => command.setName('filter').setDescription(`Enable discord's default filter system, 1-3 scale of strictness`)
        .addIntegerOption(option => option.setName('level')
        .setDescription('1 means only slurs, 2 is slurs and sexual content, and 3 is all of the above and extreme profanity').setRequired(false)))
        .addSubcommand(command => command.setName('message-spam').setDescription('block spam messages'))
        .addSubcommand(command => command.setName('mention-spam').setDescription('block spam mentions').addIntegerOption(option => option.setName('number').setDescription('number of mentions that it takes to block a message').setRequired(true)))
        .addSubcommand(command => command.setName('censor-word').setDescription('censor a word').addStringOption(option => option.setName('word').setDescription('word to censor').setRequired(true)))
        .addSubcommand(command => command.setName('remove-rule').setDescription('remove a rule by id').addStringOption(option => option.setName('id').setDescription('rule to remove').setRequired(true)))
        .addSubcommand(command => command.setName('toggle-rule').setDescription('toggle a rule by id').addStringOption(option => option.setName('id').setDescription('rule to toggle').setRequired(true))),

    async execute(interaction) {
        const { guild, options } = interaction;
        const sub = options.getSubcommand();
        const currentRules = await guild.autoModerationRules.fetch();
        let creatingRule = false; //to keep track of wether a rule is being created or deleted
        let statusMsg; //to display in our status embed

        await interaction.reply({ content: 'Loading automod rule...', flags: MessageFlags.Ephemeral });

        try {
            //change rule options based on what was given to the command
            let ruleOptions;

            switch (sub) {
                case 'filter':
                    const level = options.getInteger('level'); //retrieve level
                    let fltrlvl; //filter level
                    //throw error for invalid level value
                    if((level > 3 || level < 1) && level !== null){ throw new Error('Invalid value for level. Must be between 1 and 3')}
                    //handle level value
                    if(!level || level == 1){fltrlvl = [3]}
                    if(level == 2){fltrlvl = [2, 3]}
                    if(level == 3){fltrlvl = [1, 2, 3]}

                    //fields for the rules to add to automod
                    ruleOptions = {
                        name: 'Block slurs / targeted language',
                        eventType: AutoModerationRuleEventType.MessageSend,
                        triggerType: AutoModerationRuleTriggerType.KeywordPreset,
                        triggerMetadata: { presets: fltrlvl }, 
                        actions: [{ type: AutoModerationActionType.BlockMessage, metadata:  { customMessage: 'Message blocked: contains filtered content.' }}],
                        enabled: true
                    };
                    creatingRule = true;
                    break;

                case 'censor-word':
                    const word = options.getString('word');
                    ruleOptions = {
                        name: `Censor: ${word}`,//add '**' around word to make it a wildcard, meaning it will catch words embedded in another word
                        eventType: AutoModerationRuleEventType.MessageSend,
                        triggerType: AutoModerationRuleTriggerType.Keyword, 
                        triggerMetadata: { keywordFilter: [`*${word}*`] },//wildcard
                        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: `Message was blocked because it contained the word "${word}" which violates the server's filter policy` }}],
                        enabled: true
                    };
                    creatingRule = true;
                    break;

                case 'message-spam':
                    ruleOptions = {
                        name: 'Prevent spam messages',
                        eventType: AutoModerationRuleEventType.MessageSend,
                        triggerType: AutoModerationRuleTriggerType.Spam,
                        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: {  customMessage: 'Message blocked due to suspected spam' }}],
                        enabled: true
                    };
                    creatingRule = true;
                    break;

                case 'mention-spam':
                    const limit = options.getInteger('number');
                    ruleOptions = {
                        name: 'Prevent spam mentions',
                        eventType: AutoModerationRuleEventType.MessageSend,
                        triggerType: AutoModerationRuleTriggerType.MentionSpam,
                        triggerMetadata: { mentionTotalLimit: limit, mentionRaidProtectionEnabled: true }, //protect from raids
                        actions: [{ type: AutoModerationActionType.BlockMessage, metadata: { customMessage: 'Message blocked due to suspected mention spam' }}],
                        enabled: true
                    };
                    creatingRule = true;
                    break;
            }

            //create rule
            if(creatingRule){
                //create rule
                try {
                    //to catch pe-existing rule
                    await guild.autoModerationRules.create(ruleOptions);
                    statusMsg = `:white_check_mark: Automod rule for ${sub} has been created successfully.`;
                } catch (error) {
                    //if exists update
                    const preRule = currentRules.find(rule => rule.name === ruleOptions.name);
                    preRule.edit(ruleOptions);
                    statusMsg = `:white_check_mark: Automod rule for ${sub} has been updated successfully.`;
                }
            } else if(sub === 'remove-rule') {
                //delete rule
                const ID = options.getString('id');
                await guild.autoModerationRules.delete(ID); //retrieve rule ID for deletion
                statusMsg = `:white_check_mark: Automod rule #${ID} has been deleted successfully.`;
            } else if(sub === 'toggle-rule') {
                const ID = options.getString('id');
                const rule = await guild.autoModerationRules.fetch(ID);
                let state;
                //throw error if rule #______ does not exist
                if(!rule) {
                    throw new Error(`Rule #${ID} not found`);
                }

                //Toggle rule if its found
                if(rule.enabled) {
                    await guild.autoModerationRules.edit(ID,{
                        enabled: false
                    });
                    state = 'deactivated';
                } else {
                    await guild.autoModerationRules.edit(ID,{
                        enabled: true //works for censor-word too, not sure why but I'm not touching it
                    });
                    state = 'activated';
                }
                statusMsg = `:white_check_mark: Automod rule ${rule.name} #${ID} has been ${state} successfully.`;
            }

            //success embed
            const success = new EmbedBuilder()
                .setColor("Green")
                .setDescription(statusMsg);

            await interaction.editReply({ content: null, embeds: [success] });

        } catch (err) {
            //update statusMsg to reflect proper operation
            if(creatingRule) {
                statusMsg = `:cross_mark: Failed to create automod rule: ${err.message}`;
            } else {
                statusMsg = `:cross_mark: Failed remove or toggle automod rule: ${err.message}`;
            }

            //create the failure embed
            const failure = new EmbedBuilder()
                .setColor("Red")
                .setDescription(statusMsg);

            console.error(err);
            await interaction.editReply({ content: null, embeds: [failure] });
        }
    },
};