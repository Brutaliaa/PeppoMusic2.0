//#region Imports
const {
  CommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
} = require("discord.js");
const { playSong, isPlaying } = require("../../music/player.js");
const { embeds } = require("../../Embeds/Utilities/embeds.js");
const {
  getSongInfo,
  getFormattedTotalQueueDuration,
} = require("../../music/song.js");
const { queue } = require("../../music/queueManager.js");

const ytdl = require("@distube/ytdl-core");
const ytpl = require("ytpl");
//#endregion

//#region Play Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song or playlist in the voice channel")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("YouTube URL or Playlist")
        .setRequired(true)
    )
    .setContexts(0),
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const songURL = interaction.options.getString("url");

    // If it's a playlist
    if (ytpl.validateID(songURL)) {
      // Playlist support
      let playlist;
      try {
        playlist = await ytpl(songURL, { pages: 1 });
      } catch (err) {
        return interaction.reply({
          content: "Failed to fetch playlist info. Is the URL valid?",
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = embeds({
        nameCommand: interaction.commandName,
        userURL: interaction.user.displayAvatarURL(),
        description: `Added **${playlist.items.length}** songs from the playlist **${playlist.title}** to the queue.`,
        color: "Green",
      });
      embed
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
        })
        .setThumbnail(playlist.bestThumbnail?.url || null);
      await interaction.reply({ embeds: [embed], withResponse: true });

      const firstSong = await getSongInfo(
        playlist.items[0].shortUrl,
        interaction.member.voice.channel,
        interaction.user,
        true
      );

      queue.push(firstSong);
      if (!isPlaying) {
        await playSong(interaction, firstSong);
      }

      const restItems = playlist.items.slice(1);
      Promise.all(
        restItems.map((item) =>
          getSongInfo(
            item.shortUrl,
            interaction.member.voice.channel,
            interaction.user,
            true
          )
        )
      ).then((restSongs) => {
        queue.push(...restSongs);
      });
      return;
    }

    // If it's a single YouTube video
    if (ytdl.validateURL(songURL)) {
      const song = await getSongInfo(
        songURL,
        interaction.member.voice.channel,
        interaction.user,
        false // notPlaylist
      );
      const embed = embeds({
        nameCommand: interaction.commandName,
        userURL: interaction.user.displayAvatarURL(),
        description: `Playing song from URL: [${song.name}](${song.url})`,
        color: "Blue",
      });

      await interaction.reply({ embeds: [embed], withResponse: true });
      await playSong(interaction, song);
      return;
    }

    // If neither, send error
    return interaction.reply({
      content: "Please provide a valid YouTube video or playlist URL.",
      flags: MessageFlags.Ephemeral,
    });
  },
};
//#endregion
