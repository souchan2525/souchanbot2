const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    async execute(interaction) {
        try {
            if (!interaction.isChatInputCommand()) return;
            if (interaction.commandName === "weather") {
                const city = interaction.options.getString("city")
                const bool = interaction.options.getString("bool")
                const link = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.appid}&units=metric&lang=ja`)
                const data = await link.json()
                if (data.cod !== 200) {
                    return await interaction.reply({
                        content: "その都市の天気が見つかりませんでした...",
                        ephemeral: true
                    })
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
                        { name: "風速", value: `:wind_blowing_face: ${data.wind.speed}m/s`, inline: true },
                        { name: "日の出", value: `🌄 <t:${data.sys.sunrise}:T>`, inline: true },
                        { name: "日の入り", value: `🌅 <t:${data.sys.sunset}:T>`, inline: true },
                    )
                    .setFooter({ text: "提供元:OpenWeatherMap" })
                if (bool === "true") {
                    embed.spliceFields(0, 1, { name: "都市名", value: `🏙 ||ひみつ||`, inline: true });
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
                    })
                }
            }
        } catch (er) {
            console.error(er)
            await interaction.reply("送信に失敗しました...")
        }
    }
};

