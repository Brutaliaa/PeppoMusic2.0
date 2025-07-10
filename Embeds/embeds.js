//#region Imports
const { EmbedBuilder } = require("discord.js");
const { OWNER_ID } = process.env;
//#endregion

//#region Basic Embed
/**
 *
 * @param {string} nameCommand
 * The Name of the command, used for the author name.
 * @param {string} [userURL]
 * Optional, it's the URL of the user avatar, used for the author icon.
 * @param {string} description
 * The description of the embed.
 * @param {string|number} color
 * The color of the embed. Can be a string or a number.
 * @returns {EmbedBuilder}
 * Creates and returns an EmbedBuilder instance with the specified properties.
 */
function embeds(nameCommand, userURL, description, color) {
  return new EmbedBuilder()
    .setAuthor({
      name: `${nameCommand[0].toUpperCase() + nameCommand.slice(1)} Command`,
      iconURL: userURL ? userURL : undefined,
    })
    .setDescription(description)
    .setColor(color)
    .setTimestamp();
}
//#endregion

//#region Embeds exports
module.exports = {
  embeds,
};
//#endregion
