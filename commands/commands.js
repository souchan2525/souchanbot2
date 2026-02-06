const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { supabase } = require("../bot.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("message")
      .setDescription("メッセージを言ってくれるよ！")
      .addStringOption(o => o.setName("text").setRequired(true))
      .addIntegerOption(o => o.setName("num").setMinValue(1).setMaxValue(5)),
    async execute(interaction) {
      const text = interaction.options.getString("text");
      const num = interaction.options.getInteger("num") ?? 1;

      await interaction.reply({ content: `送信開始！（${num}回）`, ephemeral: true });
      for (let i = 0; i < num; i++) {
        setTimeout(() => interaction.followUp(text), 700);
      }
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
      .addStringOption(o => o.setName("city").setRequired(true))
      .addStringOption(o =>
        o.setName("bool")
          .setRequired(true)
          .setChoices(
            { name: "伏せる", value: "true" },
            { name: "伏せない", value: "false" }
          )
      ),
    async execute(interaction) {
      try {
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName === "weather") {
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
              { name: "体感温度", value: `🧘 ${data.main.feels_like
    }
  }
];
