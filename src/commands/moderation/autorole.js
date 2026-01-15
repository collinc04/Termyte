const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags } = require('discord.js');
const reactionroles = require('../../schemas/reactionroles.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('set up a reaction role system')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand(command => command.setName('add').setDescription('add a reaction role to a message') //add data
    .addStringOption(option => option.setName('message-url').setDescription('Message to react to for the role system').setRequired(true))
    .addStringOption(option => option.setName('emoji').setDescription('emoji to react with').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('role to give').setRequired(true))
    .addStringOption(option => option.setName('label').setDescription('Name for the role assignment').setRequired(false)))
    .addSubcommand(command => command.setName('remove').setDescription('remove a reaction role from a message') //remove data
    .addStringOption(option => option.setName('message-url').setDescription('Message to remove role from').setRequired(true))
    .addStringOption(option => option.setName('emoji').setDescription('emoji reaction to remove role assignment').setRequired(true))),

    async execute(interaction) {
        //defer to prevent database related crashes
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        //define constants
        const autorolemsg = new EmbedBuilder().setTitle('autorole system manager');
        const {options, guild, channel} = interaction;
        const sub = options.getSubcommand();
        const emoji = options.getString('emoji');

        //store name if unicode store id if custom
        const regex = /<?(?:a:)?(?:\w+):(\d+)>?/;
        const match = emoji.match(regex);
        const emojiData = match ? match[1] : emoji;

        try {
            let errorCode;
            //Obtain message id through url which is more user friendly
            const urlraw = options.getString('message-url');
            const messageID = urlraw.includes('/') 
                ? urlraw.split('/').pop() 
                : urlraw;
            const message = await channel.messages.fetch(messageID).catch(err => {
                errorCode = err; //catch error code
            })

            if(errorCode) { 
                throw new Error(`Message must be from ${channel}`);
            }

            const data = await reactionroles.findOne({ Guild: guild.id, Message: message.id, Emoji: emojiData})
            //set color
            autorolemsg.setColor('Green');

            switch(sub) {
                case 'add':
                    //if rr already exists notify user
                    const label = options.getString('label');

                    if(data){
                        throw new Error(`an autorole setup already exists with ${emoji} for this message`);
                    } else {
                        const role = options.getRole('role');
                        await reactionroles.create({
                            Guild: guild.id,
                            Message: message.id,
                            Emoji: emojiData,
                            Role: role.id,
                            Label: label || 'role assignment'
                        });

                        autorolemsg.setDescription(`reaction role assignment created for ${message.url} with ${emoji} and ${role}`);
                        await message.react(emoji);
                        await interaction.editReply({embeds: [autorolemsg], flags: MessageFlags.Ephemeral});

                    }
                    break;

                case 'remove':
                    if(!data) {
                        throw new Error(`Reaction role does not exist`);
                    } else {
                        const label = data.Label;
                        await reactionroles.deleteMany({
                            Guild: guild.id,
                            Message: message.id,
                            Emoji: emojiData
                        });

                        //remove the reaction
                        const reaction = message.reactions.cache.get(emojiData);
                        if (reaction) {
                            await reaction.users.remove(interaction.client.user.id);
                        }

                        autorolemsg.setDescription(`reaction role assignment ${label} was removed`);
                        await interaction.editReply({embeds: [autorolemsg], flags: MessageFlags.Ephemeral});
                    }
                    break;
            }
        } catch (error) {
            //handle errors
            autorolemsg.setColor('Red');
            autorolemsg.setDescription(`:x: ${error}`);
            await interaction.editReply({embeds: [autorolemsg], flags: MessageFlags.Ephemeral});
        }
    }
}