// ci-test.js
require("dotenv").config({ path: "./private/private.env" });
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log("Bot logged in successfully!");
  process.exit(0);
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
  process.exit(1);
});

client.login(process.env.TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
