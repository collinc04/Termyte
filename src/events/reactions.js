const { Events } = require('discord.js');
const reactionroles = require('../schemas/reactionroles.js');


//Role adding
module.exports = {
    name: Events.MessageReactionAdd,

    //when a rection is added
    async execute(reaction, user) {
        if(user.bot) return;

        if(reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.log(error);
                return;
            }   
        }

        const { guild } = reaction.message;
        const emoji = reaction.emoji.id || reaction.emoji.name;

        //search database for the assignment
        const data = await reactionroles.findOne({
            Guild: guild.id,
            Message: reaction.message.id,
            Emoji: emoji
        });

        if(!data) return; //if no assignment do not do anything

        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(data.Role);

        if(role){
            try {
                await member.roles.add(role);
            } catch (error) {
                console.log(error);
            }
        }
    }
}