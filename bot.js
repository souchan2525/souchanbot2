require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// Supabase クライアント
const supabase = createClient(
  process.env.baseurl,
  process.env.basekey
);

// Discord クライアント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンドコレクション
client.commands = new Collection();

// commands/commands.js を読み込む
const commandsPath = path.join(__dirname, "commands", "commands.js");
const commandFile = require(commandsPath);

// commands.js が複数コマンドを export している前提
for (const command of commandFile) {
  client.commands.set(command.data.name, command);
  console.log(`Loaded command: ${command.data.name}`);
}

// スラッシュコマンド実行
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "エラーが発生しました...", ephemeral: true });
    } else {
      await interaction.reply({ content: "エラーが発生しました...", ephemeral: true });
    }
  }
});

// ログイン
client.login(process.env.token);

// Supabase を commands.js で使えるように export
module.exports = { supabase };
