const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

let agent = null;
try {
  const cookies = JSON.parse(
    fs.readFileSync("./private/youtubeCookie.json", "utf8")
  );
  agent = ytdl.createAgent(cookies);
} catch (e) {
  agent = null;
}

module.exports = agent;
