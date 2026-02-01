const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf8"));
module.exports = {
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            if (interaction.commandName === "inventory") {
                const userid = String(interaction.user.id);
                const username = interaction.user.globalName
                const money = data[userid].money;
                const embed = new EmbedBuilder()
                    .setTitle("現在の所持金💰")
                    .setDescription(`${money}コイン`)
                    .setColor("Gold")
                    .setFooter({
                        text: `実行者:${username}`
                    })
                interaction.reply({
                    embeds: [embed]
                })
            }
        } catch (er) {
            console.error("エラー内容:" + er)
        }
    }

};


