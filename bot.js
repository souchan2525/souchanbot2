const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
require("dotenv").config()
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient( process.env.baseurl, process.env.basekey );

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({
                content: "エラーが発生しました...", ephemeral: true
            });
        } else {
            await interaction.reply({ content: "エラーが発生しました...", ephemeral: true }); 
        }
    }
});

client.once("ready", () => {
    console.log(`ログイン完了: ${client.user.tag}`);
});

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(3000, () => {
  console.log("Ping server running");
});

client.login(process.env.token);



