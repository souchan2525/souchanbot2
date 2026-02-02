require("dotenv").config();
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.baseurl,
  process.env.basekey
);

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
        .setDescription("ユーザーIDを入力してね！")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      const executorId = interaction.user.id;
      const adminlist = ["830518901221490740", "1395712192795512902"];

      // 管理者チェック
      if (!adminlist.includes(executorId)) {
        return interaction.reply({
          content: "これはbot管理者のみ実行できます！",
          ephemeral: true
        });
      }

      const amount = interaction.options.getInteger("balance");
      const targetUser = interaction.options.getString("user");

      // 現在の所持金を取得
      const { data, error } = await supabase
        .from("money")
        .select("money")
        .eq("user_id", targetUser)
        .single();

      const currentMoney = data ? data.money : 0;

      // 更新（なければ作成）
      const { error: upsertError } = await supabase
        .from("money")
        .upsert({
          user_id: targetUser,
          money: currentMoney + amount
        });

      if (upsertError) {
        console.error(upsertError);
        return interaction.reply({
          content: "データ更新中にエラーが発生しました...",
          ephemeral: true
        });
      }

      // 返信
      const embed = new EmbedBuilder()
        .setTitle("💰お金を追加しました！")
        .setDescription(`<@${targetUser}> さんに **${amount} コイン** 追加しました！`)
        .setColor("Green")
        .setFooter({ text: `実行者: ${interaction.user.globalName}` });

      interaction.reply({ embeds: [embed] });

    } catch (er) {
      console.error("エラー内容:", er);

      if (interaction.deferred || interaction.replied) {
        return interaction.followUp({
          content: "エラーが発生しました…",
          ephemeral: true
        });
      }

      interaction.reply({
        content: "エラーが発生しました…",
        ephemeral: true
      });
    }
  }
};
