//#region Imports
const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const { embeds } = require("../../Embeds/Utilities/embeds.js");
//#endregion

//#region Execute Function
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Gives the ping of the bot")
    .setContexts(0), // 0 = Guild Only - 1 = BotDM - 2 = Groups DMs and DMs other than the bot
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = embeds({
      nameCommand: interaction.commandName,
      userURL: interaction.user.displayAvatarURL(),
      description: "Calculating ping...",
      color: "Red",
    });

    await interaction.reply({
      embeds: [embed],
      withResponse: true,
    });
    embed
      .setDescription(
        `Pong! \n${Date.now() - interaction.createdTimestamp} ms.`
      )
      .setColor("Green");

    return interaction.editReply({ embeds: [embed] });
  },
};
//#endregion
