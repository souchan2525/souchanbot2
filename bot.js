require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// Supabase
const supabase = createClient(process.env.baseurl, process.env.basekey);

// Discord クライアント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンド読み込み
client.commands = new Collection();
const commands = require("./commands/commands.js");

// Discord API に送る JSON
const slashData = [];

for (const command of commands) {
  client.commands.set(command.data.name, command);
  slashData.push(command.data.toJSON());
  console.log(`Loaded command: ${command.data.name}`);
}

// スラッシュコマンド登録（deploy）
const rest = new REST({ version: "10" }).setToken(process.env.token);

(async () => {
  try {
    console.log("🔄 スラッシュコマンドを Discord に登録中…");

    await rest.put(
      Routes.applicationCommands(process.env.clientid),
      { body: slashData }
    );

    console.log("✅ スラッシュコマンド登録完了！");
  } catch (err) {
    console.error("❌ コマンド登録中にエラー...:", err);
  }
})();

// コマンド実行
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "エラーが発生しました...", ephemeral: true });
    } else {
      await interaction.reply({ content: "エラーが発生しました...", ephemeral: true });
    }
  }
});

// ログイン
client.login(process.env.token);

// Supabase を他ファイルで使えるように export
module.exports = { supabase };
