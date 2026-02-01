const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("botが生きてるか確認できるよ！")
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            const sent = await interaction.reply({ content: "計測中...", fetchReply: true });
            const ping = sent.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply( `🏓 **Pong!**\n` + `メッセージ応答速度: **${ping}ms**\n` ); }
        } catch (er) {
            console.error("エラー内容:" + er)
        }
    }
};
