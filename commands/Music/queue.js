const { queue } = require("../../music/queueManager.js");
const { getFormattedTotalQueueDuration } = require("../../music/song.js");
const {
  CommandInteraction,
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const {
  pagination,
  ButtonTypes,
  ButtonStyles,
} = require("@devraelfreeze/discordjs-pagination");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the queue. Will show a maximum of 15 songs per pages")
    .setContexts(0),
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    if (!queue.length) {
      const noMusicFound = new EmbedBuilder()
        .setAuthor({
          name: `PeppoMusic`,
          iconURL: interaction.member.displayAvatarURL(),
        })
        .setTitle(`No music was found in queue.`)
        .setColor("#37ff00")
        .setTimestamp()
        .addFields({
          name: "How can you add music?",
          value: `You can add music by using the /play command`,
          inline: true,
        });
      return interaction.reply({ embeds: [noMusicFound] });
    }

    // Paginate if more than 2 songs
    let embeds = [];
    const songs = queue.length;

    if (songs >= 2) {
      const pages = Math.ceil(songs / 15);
      for (let p = 1; p <= pages; p++) {
        const nowPlaying = queue[0];
        let music_np = new EmbedBuilder()
          .setAuthor({
            name: `Now playing : `,
            iconURL: interaction.member.displayAvatarURL(),
          })
          .setTitle(nowPlaying.name)
          .setURL(nowPlaying.url)
          .setThumbnail(nowPlaying.thumbnail)
          .setColor("Blue")
          .addFields(
            {
              name: "Song Duration",
              value: `**${nowPlaying.formatDuration}**`,
              inline: true,
            },
            {
              name: "Channel",
              value: `<#${nowPlaying.voiceChannel.id}>`,
              inline: true,
            },
            {
              name: "Requested by",
              value: `<@${nowPlaying.requestedBy.id}>`,
              inline: true,
            },
            {
              name: "URL",
              value: nowPlaying.url,
              inline: false,
            },
            {
              name: "__Queue__ : ",
              value: "** **",
              inline: false,
            }
          )
          .setFooter({
            text: `Total playlist time : ${getFormattedTotalQueueDuration(
              queue
            )}`,
          })
          .setTimestamp();

        // Place up to 15 songs in each page
        for (let i = 1; i <= 15; i++) {
          let totalSongNumber = (p - 1) * 15 + i;
          if (totalSongNumber >= queue.length) break;
          music_np.addFields({
            name: `${totalSongNumber}. ${queue[totalSongNumber].name}`,
            value: `${queue[totalSongNumber].url}`,
            inline: false,
          });
        }
        embeds.push(music_np);
      }
    } else {
      const nowPlaying = queue[0];
      const music_np = new EmbedBuilder()
        .setAuthor({
          name: `Now playing : `,
          iconURL: interaction.member.displayAvatarURL(),
        })
        .setTitle(nowPlaying.name)
        .setURL(nowPlaying.url)
        .setThumbnail(nowPlaying.thumbnail)
        .setColor("Blue")
        .addFields(
          {
            name: "Song Duration",
            value: `**${nowPlaying.formatDuration}**`,
            inline: true,
          },
          {
            name: "Channel",
            value: `<#${nowPlaying.voiceChannel.id}>`,
            inline: true,
          },
          {
            name: "Requested by",
            value: `<@${nowPlaying.requestedBy.id}>`,
            inline: true,
          },
          {
            name: "URL",
            value: nowPlaying.url,
            inline: false,
          }
        )
        .setFooter({
          text: `Total playlist time : ${getFormattedTotalQueueDuration(
            queue
          )}`,
        })
        .setTimestamp();
      return interaction.reply({ embeds: [music_np] });
    }

    // Paginate if there's more than one page
    await pagination({
      embeds: embeds,
      author: interaction.member.user,
      interaction: interaction,
      time: 90000,
      disableButtons: false,
      fastSkip: true,
      pageTravel: false,
      ephemeral: false,
      buttons: [
        {
          type: ButtonTypes.first,
          label: `First page`,
          style: ButtonStyles.Secondary,
          emoji: `⏮️`,
        },
        {
          type: ButtonTypes.previous,
          label: `Previous page`,
          style: ButtonStyles.Primary,
          emoji: `◀️`,
        },
        {
          type: ButtonTypes.next,
          label: `Next page`,
          style: ButtonStyles.Primary,
          emoji: `▶️`,
        },
        {
          type: ButtonTypes.last,
          label: `Last page`,
          style: ButtonStyles.Secondary,
          emoji: `⏭️`,
        },
      ],
    });
  },
};
