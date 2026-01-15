const { Client, GatewayIntentBits, Events } = require('discord.js');
const g_policies = require('../schemas/g_policies.js');

//workaround for discord not allowing automod to block and timeout at the same time.
module.exports = {
    name: Events.AutoModerationActionExecution,
    async execute(action) {
        //handle automod rule violations
        const { member, guild, ruleId, action: executedAction } = action;
        const violationUserId = await guild.members.fetch(action.userId);
        const guildId = action.guild.id;

        //retrieve policy file
        const data = await g_policies.findOne({ Guild: guildId });

        if(data !== null) {
            console.log(`Rule violated by ${violationUserId}`);

            if(data.Enforcement) {
                let mag = data.EnforcementMagnitude;
                mag = mag *60000 //convert to ms from s
                await violationUserId.timeout(mag, 'automod rule violation');
            }
        }
    }
}