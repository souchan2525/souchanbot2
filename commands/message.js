const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("message")
        .setDescription("メッセージを言ってくれるよ！")
        .addStringOption(option =>
            option.setName("text")
                .setDescription("言わせたいことを書いてね！")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("num")
                .setDescription("1から5の間で選んでね！")
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            if (interaction.commandName === "message") {
                const text = interaction.options.getString("text");
                const num = interaction.options.getInteger("num") ?? 1;

                await interaction.reply({
                    content: `送信開始！（${num}回）`,
                    ephemeral: true
                });
                for (let i = 0; i < num; i++) {
                    setTimeout(async () => {
                        await interaction.followUp(text)
                    }, 700);
                }
            }
        } catch (er) {
            console.error("エラー内容:" + er)
        }
    }
};