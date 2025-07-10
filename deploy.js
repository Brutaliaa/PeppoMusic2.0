//#region Imports
const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config({ path: "./private/private.env" });
const { TOKEN, BOT_ID } = process.env;
// Ensure the TOKEN and BOT_ID are defined
const fs = require("fs");
const path = require("path");
const commands = [];
// Grab all the command files from the commands directory
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);
//#endregion

//#region Deploy Commands
for (const folder of commandFolders) {
  // Grab all the command files from the commands directory
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The file ${file} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Deploy the commands to the Discord API
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    // The put method is used to fully refresh all commands in the client with the current set
    const data = await rest.put(Routes.applicationCommands(BOT_ID), {
      body: commands,
    });
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // Catch and log any errors that occur during the deployment
    console.error("Error deploying commands:", error);
  }
})();
//#endregion
