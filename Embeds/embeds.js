//#region Imports
const { EmbedBuilder } = require("discord.js");
const { OWNER_ID } = process.env;
//#endregion

//#region Basic Embed
/**
 * Creates an embed with flexible options.
 *
 * @param {Object} options
 * @param {string} [options.nameCommand] - Name of the command for author title.
 * @param {string} [options.userURL] - URL for the author's icon.
 * @param {string} [options.description] - Description of the embed.
 * @param {string|number} [options.color] - Color of the embed.
 * @returns {EmbedBuilder}
 */
function embeds({
  nameCommand = "",
  userURL,
  description = "",
  color = "Random",
} = {}) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${nameCommand[0]?.toUpperCase() + nameCommand.slice(1)} Command`,
      iconURL: userURL || undefined,
    })
    .setDescription(description)
    .setTimestamp();

  if (color) embed.setColor(color);
  return embed;
}
//#endregion

//#region Embeds exports
module.exports = {
  embeds,
};
//#endregion
