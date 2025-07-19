//#region Imports
const {
  Client,
  GatewayIntentBits,
  Collection,
  MessageFlags,
} = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const { embeds } = require("./Embeds/Utilities/embeds.js");
const { resetMusicState } = require("./music/player.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  presence: {
    status: "online",
    activities: [
      {
        name: "musics",
        type: 1, // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching
        state: "but listening to Jazz on the side",
        url: "https://www.youtube.com/watch?v=HuFYqnbVbzY",
      },
    ],
  },
});
dotenv.config({ path: "./private/private.env" });
const { TOKEN, OWNER_ID } = process.env;
//#endregion

//#region Commands Handler
function commandHandler() {
  const path = require("path");

  client.commands = new Collection();
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    console.log(`\nIn ${folder} folder : `);
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(`\t${file}`);
      } else {
        console.log(
          `[WARNING] The file ${file} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}
//#endregion

//#region Interaction Event
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const exceptionThrowed = embeds({
    nameCommand: interaction.commandName,
    userURL: interaction.user.displayAvatarURL(),
    description: `An error occurred while executing the command \`${interaction.commandName}\`.`,
    color: "Red",
  });

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    exceptionThrowed.addFields({ name: `Error`, value: `${error}` });
    await interaction.reply({
      embeds: [exceptionThrowed],
      flags: MessageFlags.Ephemeral,
    });
    if (OWNER_ID !== undefined) {
      exceptionThrowed.setDescription(null);
      exceptionThrowed.addFields(
        {
          name: `Jump to channel`,
          value: `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`,
        },
        {
          name: `Executor`,
          value: `<@${
            (await interaction.guild.members.fetch(interaction.user.id)).id
          }>`,
        }
      );
      await interaction.client.users.fetch(OWNER_ID, false).then((user) => {
        user.send({ embeds: [exceptionThrowed] });
      });
    }
  }
});
//#endregion

//#region Utility
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  commandHandler();
});

client.login(TOKEN);

client.on("voiceStateUpdate", (oldState, newState) => {
  // if the user left the voice channel, reset the music state
  if (
    oldState.channelId &&
    !newState.channelId &&
    oldState.member.id === client.user.id
  ) {
    resetMusicState();
  }
});
//#endregion
