const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const fs = require("fs");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("現在の所持金を表示します！"),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        try {
            if (interaction.commandName === "inventory") {
                const userid = String(interaction.user.id);
                const username = interaction.user.globalName
                const { data, error } = await supabase
                    .from("money")
                    .select("money")
                    .eq("user_id", userid)
                    .single() ?? 0;
                const money = data ? data.money : 0;
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




