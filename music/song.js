/**
 * @typedef {Object} SongObj
 * @property {string} name - The name of the song.
 * @property {string} url - The URL of the song.
 * @property {number} views - The number of views the song has.
 * @property {number} duration - The duration of the song in seconds.
 * @property {string} formatDuration - The formatted duration of the song.
 * @property {string} thumbnail - The thumbnail URL of the song.
 * @property {boolean} fromPlaylist - Whether the song is from a playlist.
 * @property {boolean} isNSFW - Whether the song is marked as NSFW.
 * @property {boolean} isLive - Whether the song is a live stream.
 * @property {string} uploader - The uploader of the song.
 * @property {VoiceChannel} voiceChannel - The voice channel where the song will be played.
 * @property {User} requestedBy - The user who requested the song.
 */

/**
 * @typedef {SongObj[]} SongArray
 */

const ytdl = require("@distube/ytdl-core");
const ytdlAgent = require("../music/ytdlAgent.js");

function formatDuration(seconds) {
  if (isNaN(seconds) || seconds === 0) return "Live";
  seconds = Math.floor(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
}

/**
 * Get formatted total duration for a playlist.
 * @param {Array<SongObj>} songList
 * @returns {string}
 */
function getFormattedTotalQueueDuration(songList) {
  const totalSeconds = songList.reduce(
    (sum, s) => sum + (Number(s.duration) || 0),
    0
  );
  return formatDuration(totalSeconds);
}

async function getSongInfo(
  url,
  voiceChannel,
  requestedBy,
  fromPlaylist = false
) {
  const info = await ytdl.getInfo(url, {
    ...(ytdlAgent && { agent: ytdlAgent }),
  });
  const details = info.videoDetails;
  const duration = Number(details.lengthSeconds);

  return {
    name: details.title,
    url: details.video_url,
    views: Number(details.viewCount),
    duration: Number(details.lengthSeconds),
    formatDuration: formatDuration(duration),
    thumbnail: details.thumbnails?.[details.thumbnails.length - 1]?.url,
    fromPlaylist: fromPlaylist,
    isNSFW: !!details.age_restricted,
    isLive: !!details.isLiveContent,
    uploader: details.author?.name,
    voiceChannel: voiceChannel,
    requestedBy: requestedBy,
  };
}

module.exports = { getSongInfo, getFormattedTotalQueueDuration };
