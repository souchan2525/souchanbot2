require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const app = express();

// Supabase
const supabase = createClient(process.env.baseurl, process.env.basekey);

// Discord クライアント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: ['GUILD_MEMBER', 'USER', 'MESSAGE']
});

const roles = {
  "1422491800677126257": [
    "1425982074992464024", "1425982078239113415", "1425982096773615627",
    "1425982100091310110"
  ],
  "1238284055540138005": [
    "1380458612756844718", "1401859345141993563", "1395987264915374181",
    "1397509114602459217", "1395912754828804167"
  ]
}

//  スラッシュコマンド一覧
// const guildcommand = []
const commands = [
  {
    name: "message",
    async execute(interaction) {
      const text = interaction.options.getString("text");
      await interaction.reply({ content: "送信します！", ephemeral: true });
      await interaction.followUp({ content: text });
    }
  },

  {
    name: "ping",
    async execute(interaction) {
      await interaction.reply("pong!\nbotは生きてるよ！");
    }

  },

  {
    name: "weather",
    async execute(interaction) {
      try {    
        const city = interaction.options.getString("city");
        const bool = interaction.options.getString("bool");
    
        const link = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.appid}&units=metric&lang=ja`
        );
        const data = await link.json();
    
        if (data.cod !== 200) {
          return await interaction.reply("その都市の天気が見つかりませんでした...");
        }
    
        const embed = new EmbedBuilder()
          .setColor("Gold")
          .setTitle("本日のお天気～！")
          .addFields(
            { name: "都市名", value: `🏙 ${data.name}`, inline: true },
            { name: "天気", value: `☀ ${data.weather[0].description}`, inline: true },
            { name: "現在の気温", value: `🌡️ ${data.main.temp}°C`, inline: true },
            { name: "体感温度", value: `🧘 ${data.main.feels_like}°C`, inline: true },
            { name: "湿度", value: `💧 ${data.main.humidity}%`, inline: true },
            { name: "風速", value: `💨 ${data.wind.speed}m/s`, inline: true },
            { name: "日の出", value: `🌄 <t:${data.sys.sunrise}:T>`, inline: true },
            { name: "日の入り", value: `🌅 <t:${data.sys.sunset}:T>`, inline: true }
          )
          .setFooter({ text: "提供元:OpenWeatherMap" });
    
        if (bool === "true") {
          embed.spliceFields(0, 1, {
            name: "都市名",
            value: `🏙 ||ひみつ||`,
            inline: true
          });
    
          await interaction.reply({ content: "送信します！", ephemeral: true });
          await interaction.followUp({ embeds: [embed] });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: false });
        }
      } catch (er) {
        console.error(er);
        try {
          await interaction.reply({ content: "送信に失敗しました...", ephemeral: true });
        } catch {} // エラーなんて握りつぶしちゃえ！（雑）
      }
    }
  },
  // ボタン
  {
    name: "help_button",
    async execute(interaction) {
      const help = new ButtonBuilder().setCustomId("commandhelp")
        .setLabel("コマンドヘルプ")
        .setStyle(ButtonStyle.Primary)
      const help2 = new ButtonBuilder().setCustomId("bothelp")
        .setLabel("botヘルプ")
        .setStyle(ButtonStyle.Success)
      const row = new ActionRowBuilder().addComponents(help, help2)
      await interaction.reply({
        content: "ヘルプメニュー↓",
        components: [row]
      })
    }
  },

  {
    name: "role_roulette",
    async execute(interaction) {
      try {
        const randint = max => Math.floor(Math.random() * max);
        const serverid = interaction.guildId
        const newrole = roles[serverid][randint(roles[serverid].length)]
        const oldrole = interaction.options.getRole("role")
        if (!interaction.member.roles.cache.has(oldrole.id)) {
          await interaction.reply({ content: "そのロールを持っていません！", ephemeral: true })
          return;
        }
        interaction.member.roles.remove(oldrole)
        await interaction.member.roles.add(newrole)
        const embed = new EmbedBuilder().setTitle("ルーレットロール結果")
          .addFields(
            { name: "ルーレット前", value: `${oldrole}`, inline: true },
            { name: "ルーレット後", value: `<@&${newrole}>`, inline: true }
          )
          .setColor("Gold")
        await interaction.reply({ embeds: [embed] })
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "ロールの操作に失敗しました..." });
      }
    }
  },

  {
    name: "role_list",
    async execute(interaction) {
      const serverid = interaction.guild.id
      const embed = new EmbedBuilder().setTitle("ルーレットロールリスト")
        .setDescription(roles[serverid].map(r => `<@&${r}>`).join("\n"))
        .setColor("Gold")
      await interaction.reply({ embeds: [embed] })
    }
  }
];

//  スラッシュコマンド登録
const rest = new REST({ version: "10" }).setToken(process.env.token);

client.once("clientReady", () => {
  console.log("Botが起動したよ！");
});

//  コマンド実行
client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === "commandhelp") {
      const embed = new EmbedBuilder()
        .setTitle("コマンドヘルプ")
        .addFields(
          { name: "message", value: "メッセージを送信するよ！" },
          { name: "ping", value: "botの生存確認をするよ！" },
          { name: "weather", value: "指定した都市の天気を表示するよ！" },
          { name: "help_button", value: "これを表示するよ！" }
        )
        .setColor("Gold")
      await interaction.reply({ ephemeral: true, embeds: [embed] });
    } else if (interaction.customId === "bothelp") {
      const embed = new EmbedBuilder()
        .setTitle("Botヘルプ")
        .setDescription("このbotはJavaScriptで作られたbotだよ！\n雑ですがソースコードはこちら\nhttps://github.com/souchan2525/souchanbot2/")
        .setColor("LightGrey")
      await interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }

  if (!interaction.isChatInputCommand()) return;
  const command = commands.find(c => c.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return;
    }
    console.error(err);
  }
});

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(3000, () => {
  console.log("Web server is running on port 3000");
});

//  ログイン
client.login(process.env.token);
