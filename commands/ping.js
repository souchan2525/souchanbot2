const { SlashCommandBuilder } = require("discord.js");
module.exports = {
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            const sent = await interaction.reply({ content: "計測中...", fetchReply: true });
            const ping = sent.createdTimestamp - interaction.createdTimestamp;
            const apiPing = interaction.client.ws.ping;
            await interaction.editReply( `🏓 **Pong!**\n` + `メッセージ応答速度: **${ping}ms**\n` + `discordAPI応答速度: **${apiPing}ms**` );
        } catch (er) {
            console.error("エラー内容:" + er)
        }
    }
};
