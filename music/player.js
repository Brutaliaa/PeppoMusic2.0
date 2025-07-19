//#region Imports
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { CommandInteraction } = require("discord.js");
const ytdl = require("@distube/ytdl-core");
const { MessageFlags } = require("discord.js");
const player = createAudioPlayer();
let currentSong = null;
module.exports.currentSong = currentSong;
const fs = require("fs");
const { queue } = require("./queueManager.js");
let isPlaying = false;

const ytdlAgent = require("../music/ytdlAgent.js");

//#endregion

//#region Player Function
/**
 * Function to play a song in a voice channel.
 *
 * @param {CommandInteraction} interaction
 * @param {Object} songObj
 * @returns
 */
async function playSong(interaction, songObj) {
  queue.push({ ...songObj, interaction });

  if (isPlaying) {
    await interaction.followUp(
      `Added to queue: [${songObj.name}](${songObj.url})`
    );
    return;
  }

  isPlaying = true;

  // Define recursive player
  const playNext = async () => {
    if (!queue.length) {
      isPlaying = false;
      return;
    }

    const { interaction: songInteraction, ...song } = queue.shift();
    let member = null;
    let voiceChannel = song.voiceChannel || null;

    if (songInteraction && songInteraction.member) {
      member = songInteraction.member;
      if (!voiceChannel) voiceChannel = member.voice.channel;
    }
    if (!voiceChannel) {
      if (songInteraction) {
        await songInteraction.reply({
          content: "You need to be in a voice channel to play music!",
          flags: MessageFlags.Ephemeral,
        });
      }
      return playNext();
    }

    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    // Wait for the connection to be ready
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (error) {
      console.error("Failed to connect to the voice channel:", error);
      if (songInteraction) {
        await songInteraction.reply({
          content: "Failed to connect to the voice channel.",
          flags: MessageFlags.Ephemeral,
        });
      }
      return playNext(); // Try the next in queue
    }

    // Create an audio resource from the song URL
    // const ytdlOptions = {
    //   filter: "audioonly",
    //   highWaterMark: 1 << 25,
    //   liveBuffer: 1 << 30,
    //   quality: "highestaudio",
    //   dlChunkSize: song.isLive ? 0 : 65536,
    // };

    const stream = ytdl(song.url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
      liveBuffer: 1 << 30,
      quality: "highestaudio",
      dlChunkSize: song.isLive ? 0 : 65536,
      ...(ytdlAgent && { agent: ytdlAgent }), // Use custom agent if available,
    });
    const ressource = createAudioResource(stream);

    player.play(ressource);
    connection.subscribe(player);
    currentSong = { ...song, voiceChannel };

    if (songInteraction) {
      await songInteraction.followUp({
        content: `Now playing: [${song.name}](${song.url})`,
      });
    }

    // Wait for song to end, then play next
    player.once(AudioPlayerStatus.Idle, () => {
      try {
        if (connection && connection.state.status !== "destroyed")
          connection.destroy();
      } catch {}
      playNext();
    });
    player.once("error", (err) => {
      console.error("Error playing song:", err);
      if (songInteraction) {
        songInteraction.followUp({
          content: "Error playing song.",
          flags: MessageFlags.Ephemeral,
        });
      }
      try {
        if (connection && connection.state.status !== "destroyed")
          connection.destroy();
      } catch {}
      playNext();
    });
  };

  // Start playing recursively
  playNext();
}
function resetMusicState() {
  queue.length = 0;
  isPlaying = false;
  if (player) {
    try {
      player.stop();
    } catch {
      player = null;
    }
  }
  console.log("Music state reset.");
}
//#endregion

//#region Export
module.exports = { playSong, resetMusicState, isPlaying };
//#endregion
