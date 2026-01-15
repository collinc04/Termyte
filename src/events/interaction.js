const { Events, MessageFlags, Collection, PermissionsBitField, EmbedBuilder } = require('discord.js');
const g_policies = require('../schemas/g_policies.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		//cooldown logic
		const { cooldowns } = interaction.client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		//retrieve policy file
		const guildId = interaction.guild.id;
		const data = await g_policies.findOne({ Guild: guildId });

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = data.CmdsCooldown || 2;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

		if(!interaction.member.permissions.has('Administrator')) {
			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
				//logic for seconds left
				const currentTime = Date.now();
				const timeLeft = Math.floor((expirationTime - currentTime) / 1000);

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1_000);
					return interaction.reply({
						content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again ${timeLeft} seconds`,
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		//end cooldown logic

		try {
			await command.execute(interaction);
		} catch (error) {
			const errorEmbed = new EmbedBuilder().setColor('red').setDescription(`:x: command execution issue ${error}`);
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [errorEmbed],
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					embeds: [errorEmbed],
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};

//from discord.js