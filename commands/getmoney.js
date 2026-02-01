const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path")
const data = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf8"));
module.exports = {
    data: new SlashCommandBuilder()
        .setName("getmoney")
        .setDescription("お金を与えます！（bot管理者専用）")
        .addIntegerOption(option => 
            option.setName("balance")
                .setDescription("金額を指定します！")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("user")
                .setDescription("ユーザーidを入力してね！")
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            if (interaction.commandName === "moneyget") {
                const userid = interaction.user.id
                const adminlist = [830518901221490740, 1395712192795512902]
                for (ad of adminlist) {
                    if (ad === userid) {
                        const money = interaction.options.getInteger("balance")
                        const user = interaction.options.getInteger("user")
                        data[user].money += parseInt(money)
                        fs.writeFileSync(__dirname + "/data.json", "utf8", JSON.stringify(data, null, 2), "utf8");
                        const embed = new EmbedBuilder()
                            .setTitle("💰お金を追加しました！")
                            .setDescription("<@${user}>さんに${money}コイン追加しました！")
                            .setFooter({
                                text: "詳しくは/inventoryで確認してみてね！"
                            })
                        interaction.reply({
                            embeds: [embed]
                        })
                    } else {
                        interaction.reply({
                            content: "これはbot管理者のみ実行できます！", ephemeral: true
                        })
                    }
                }
            }
        } catch (er) {
            console.error("エラー内容:" + er)
        }
    }
};
