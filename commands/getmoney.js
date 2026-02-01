const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
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
        .setDescription("ユーザーIDを入力してね！")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      const userid = interaction.user.id;

      // 管理者IDは文字列で持つ
      const adminlist = ["830518901221490740", "1395712192795512902"];

      // ❗ for 文ではなく includes を使う
      if (!adminlist.includes(userid)) {
        return interaction.reply({
          content: "これはbot管理者のみ実行できます！",
          ephemeral: true
        });
      }

      const money = interaction.options.getInteger("balance");
      const user = interaction.options.getString("user");

      // ユーザーが存在しなければ初期化
      if (!data[user]) data[user] = { money: 0 };

      data[user].money += money;

      // JSON 書き込み
      fs.writeFileSync(
        __dirname + "/data.json",
        JSON.stringify(data, null, 2),
        "utf8"
      );

      let embed = new EmbedBuilder()
        .setTitle("💰お金を追加しました！")
        .setDescription(`<@${user}> さんに ${money} コイン追加しました！`)
        .setFooter({ text: "詳しくは /inventory で確認してみてね！" })
      if (money < 0) {
        embed.setColor("Red")
      } else if (money > 0) {
        embed.setColor("Gold")
      } else if (money === 0) {
        embed.setColor("Default")
      }
      interaction.reply({ embeds: [embed] });

    } catch (er) {
      console.error("エラー内容:" + er);
    }
  }
};
