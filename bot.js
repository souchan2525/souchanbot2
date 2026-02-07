require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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

// ===============================
//  スラッシュコマンド一覧
// ===============================
const commands = [
  {
    data: new SlashCommandBuilder()
      .setName("message")
      .setDescription("メッセージを言ってくれるよ！")
      .addStringOption(o => o.setName("text").setDescription("言わせたい内容").setRequired(true)),
    async execute(interaction) {
      const text = interaction.options.getString("text");
      await interaction.reply({ content: "送るよ！", ephemeral: true })
      await interaction.followUp(
`${text}
\`
送信者: ${interaction.user.username}
\`
`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("botが生きてるか確認できるよ！"),
    async execute(interaction) {
      const sent = await interaction.reply({ content: "計測中...", fetchReply: true });
      const ping = sent.createdTimestamp - interaction.createdTimestamp;
      const apiPing = interaction.client.ws.ping;
      await interaction.editReply(`🏓 Pong!\n応答速度: ${ping}ms\nAPI: ${apiPing}ms`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("weather")
      .setDescription("お天気を教えてくれるよ！")
      .addStringOption(o =>
        o.setName("city")
          .setDescription("都市名（ローマ字）")
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName("bool")
          .setDescription("都市名を伏せる？")
          .setRequired(true)
          .setChoices(
            { name: "伏せる", value: "true" },
            { name: "伏せない", value: "false" }
          )
      ),
    async execute(interaction) {
      try {
        const city = interaction.options.getString("city");
        const bool = interaction.options.getString("bool");

        const link = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.appid}&units=metric&lang=ja`
        );
        const data = await link.json();

        if (data.cod !== 200) {
          return await interaction.reply({
            content: "その都市の天気が見つかりませんでした...",
            ephemeral: true
          });
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

          await interaction.reply({
            content: "送信します！",
            ephemeral: true
          });

          await interaction.followUp({
            embeds: [embed]
          });
        } else {
          await interaction.reply({
            embeds: [embed]
          });
        }
      } catch (er) {
        console.error(er);
        await interaction.reply("送信に失敗しました...");
      }
    }
  }
];

// ===============================
//  スラッシュコマンド登録
// ===============================
const rest = new REST({ version: "10" }).setToken(process.env.token);

(async () => {
  try {
    console.log("🔄 スラッシュコマンドを Discord に登録中…");

    await rest.put(
      Routes.applicationCommands(process.env.clientid),
      { body: commands.map(cmd => cmd.data.toJSON()) }
    );

    console.log("✅ スラッシュコマンド登録完了！");
  } catch (err) {
    console.error("❌ コマンド登録中にエラー:", err);
  }
})();

// ===============================
//  コマンド実行
// ===============================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.find(c => c.data.name === interaction.commandName);
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

// ===============================
//  ログイン
// ===============================
client.login(process.env.token);














