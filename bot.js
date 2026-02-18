require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const app = express();

// @ts-check

// Supabase
const supabase = createClient(process.env.baseurl, process.env.basekey);

// Discord クライアント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: ['GUILD_MEMBER', 'USER', 'MESSAGE']
});

const roles = {
  "1422491800677126257": [ // そうちゃんのbotテストサーバー
    "1425982074992464024",
    "1425982078239113415",
    "1425982096773615627",
    "1425982100091310110"
  ],
  "1238284055540138005": [ // そうちゃんのメモサーバー
    "1380458612756844718", // 管理者スター
    "1401859345141993563", // スーパーサンタ
    "1395987264915374181", // クリーナー
    "1397509114602459217", // オポチュニスト
    "1395912754828804167", // シェリフ
    "1405225584782479462", // えろちゃん
    "1400754171875033148", // ろずちゃん
    "1411540082741215383", // ばなな
    "1397513572841422848", // スリーパー
    "1395986374515101808", // メイヤー
    "1395939165165715576", // ムービング
    "1395926946298335232", // サンタ
    "1395237730987933746", // フリーター
  ],
  "1368668472942264400": [ // おいしい鯖
    "1406143372850106429", // ホモ
    "1394333614711378092", // キャンブラー
    "1381291920692740146", // 虚言癖
    "1376127246669971587", // 変態
    "1375079323345747989", // マイクラ民
    "1373657499361742959", // 知能がない人たち
    "1407018662832898178", // 壊れちゃった人
    "1381640923359744020", // ホラゲー
    "1381632691375706162", // えろちゃん
  ]
}

//  スラッシュコマンド一覧
// const guildcommand = []
const commands = [
  {
    name: "message",
    async execute(interaction) {
      const text = interaction.options.getString("text");
      await interaction.reply({ content: "送信します！", ephemeral: true });
      await interaction.followUp({ content: text });
    }
  },

  {
    name: "ping",
    async execute(interaction) {
      await interaction.reply("pong!\nbotは生きてるよ！");
    }

  },

  {
    name: "weather",
    async execute(interaction) {
      try {    
        const city = interaction.options.getString("city");
        const bool = interaction.options.getString("bool");
    
        const link = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.appid}&units=metric&lang=ja`
        );
        const data = await link.json();
    
        if (data.cod !== 200) {
          return await interaction.reply("その都市の天気が見つかりませんでした...");
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
            { name: "風速", value: `💨 ${data.wind.speed}m/s`, inline: true },
            { name: "日の出", value: `🌄 <t:${data.sys.sunrise}:T>`, inline: true },
            { name: "日の入り", value: `🌅 <t:${data.sys.sunset}:T>`, inline: true }
          )
          .setFooter({ text: "提供元:OpenWeatherMap" });
    
        if (bool === "true") {
          embed.spliceFields(0, 1, {
            name: "都市名",
            value: `🏙 ||ひみつ||`,
            inline: true
          });
    
          await interaction.reply({ content: "送信します！", ephemeral: true });
          await interaction.followUp({ embeds: [embed] });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: false });
        }
      } catch (er) {
        console.error(er);
        try {
          await interaction.reply({ content: "送信に失敗しました...", ephemeral: true });
        } catch {} // エラーなんて握りつぶしちゃえ！（雑）
      }
    }
  },

  {
    name: "help_button",
    async execute(interaction) {
      const help = new ButtonBuilder().setCustomId("commandhelp")
        .setLabel("コマンドヘルプ")
        .setStyle(ButtonStyle.Primary)
      const help2 = new ButtonBuilder().setCustomId("bothelp")
        .setLabel("botヘルプ")
        .setStyle(ButtonStyle.Success)
      const row = new ActionRowBuilder().addComponents(help, help2)
      await interaction.reply({
        content: "ヘルプメニュー↓",
        components: [row]
      })
    }
  },

  {
    name: "role_roulette",
    async execute(interaction) {
      try {
        const randint = max => Math.floor(Math.random() * max);
        const serverid = interaction.guildId
        const newrole = roles[serverid][randint(roles[serverid].length)]
        if (!newrole) {
          await interaction.reply({ content: "このサーバーのルーレットロール情報がありません！", ephemeral: true })
          return;
        }
        const oldrole = interaction.options.getRole("role").id
        if (!interaction.member.roles.cache.has(oldrole)) {
          await interaction.reply({ content: "そのロールを持っていません！", ephemeral: true })
          return;
        }
        await interaction.member.roles.remove(oldrole)
        await interaction.member.roles.add(newrole)
        const embed = new EmbedBuilder().setTitle("ルーレットロール結果")
          .addFields(
            { name: "ルーレット前", value: `<@&${oldrole}>`, inline: true },
            { name: "ルーレット後", value: `<@&${newrole}>`, inline: true }
          )
          .setColor("Gold")
        await interaction.reply({ embeds: [embed] })
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "ロールの操作に失敗しました..." });
      }
    }
  },

  {
    name: "role_list",
    async execute(interaction) {
      const serverid = interaction.guild.id
      const embed = new EmbedBuilder().setTitle("ルーレットロールリスト")
        .setDescription(roles[serverid].map(r => `<@&${r}>`).join("\n"))
        .setColor("Gold")
      await interaction.reply({ embeds: [embed] })
    }
  },

  {
    name: "timer",
    async execute(interaction) {
      const time = interaction.options.getInteger("time");
      const timer = new ButtonBuilder()
        .setLabel("タイマー")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://bot-timer.pages.dev/?sec=${time}`)
      const row = new ActionRowBuilder().addComponents(timer);
      const embed = new EmbedBuilder()
        .setTitle(`${time}秒タイマーの用意完了！`)
        .setDescription("↓のリンクからタイマーを使うことができます！")
        .setColor("Gold");
      await interaction.reply({
        embeds: [embed], components: [row]
      });
    }
  },

  {
    name: "commandhelp",
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("コマンドヘルプ")
        .setDescription("ページを選んでください")
        .setColor("Gold");

      const pageButtons = commandPages.map((_, i) => {
        return new ButtonBuilder()
          .setCustomId(`commandhelp_${i + 1}`)
          .setLabel(`ページ${i + 1}`)
          .setStyle(ButtonStyle.Primary);
      });

      const row = new ActionRowBuilder().addComponents(pageButtons);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }
  },

  {
    name: "balance",
    async execute(interaction) {
      const { data, error } = await supabase
        .from("userinfo")
        .select("money")
        .eq("userid", interaction.user.id)
        .single();
      const money = data ? data.money : 0;
      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}さんの持ち物`)
        .setDescription(`所持金: ${money}コイン`)
        .setColor("Gold")
        .setFooter({ text: "持ち物管理: supabase" })
      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    name: "poll",
    async execute(interaction) {
      const question = interaction.options.getString("question").split(", ");
      const title = interaction.options.getString("title") ?? "投票";
      if (question.length > 5) {
        await interaction.reply({ content: "選択肢は5つまでだよ！", ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(question.map((q, i) => `${i + 1}. ${q} - 0票`).join("\n"))
        .setColor("Gold")
        .setFooter({ text: "何度でも投票できるよ！" });
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
      const buttons = question.map((_, i) => {
        return new ButtonBuilder()
          .setCustomId(`poll_${interaction.id}_${i}`)
          .setEmoji(emojis[i])
          .setStyle(ButtonStyle.Primary);
      });
      const row = new ActionRowBuilder().addComponents(buttons);
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }
];

let commandPages = [];

async function loadCommandPages(client) {
  const rest = new REST({ version: "10" }).setToken(process.env.token);
  const set_command = await rest.get(
    Routes.applicationCommands(client.user.id)
  );

  const chunk = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  commandPages = chunk(set_command, 4);
}


const buttons = [
  {
    name: "commandhelp",
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("コマンドヘルプ")
        .setDescription("ページを選んでください")
        .setColor("Gold");

      const pageButtons = commandPages.map((_, i) => {
        return new ButtonBuilder()
          .setCustomId(`commandhelp_${i + 1}`)
          .setLabel(`ページ${i + 1}`)
          .setStyle(ButtonStyle.Primary);
      });

      const row = new ActionRowBuilder().addComponents(pageButtons);

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }
  },

  {
    name: "commandhelp_page",
    async execute(interaction) {
      const page = Number(interaction.customId.split("_")[1]);
      const commandsOnPage = commandPages[page - 1];

      const embed = new EmbedBuilder()
        .setTitle(`コマンドヘルプ - ページ${page}/${commandPages.length}`)
        .setColor("Gold");

      for (const command of commandsOnPage) {
        embed.addFields({
          name: command.name,
          value: command.description ?? "説明なし",
          inline: false
        });
      }

      const pageButtons = commandPages.map((_, i) => {
        return new ButtonBuilder()
          .setCustomId(`commandhelp_${i + 1}`)
          .setLabel(`ページ${i + 1}`)
          .setStyle(ButtonStyle.Primary);
      });

      const row = new ActionRowBuilder().addComponents(pageButtons);

      await interaction.update({
        embeds: [embed],
        components: [row],
        setFooter: { text: "何度でも投票できるよ！" }
      });
    }
  },

  {
    name: "poll_vote",
    async execute(interaction) {
      const [_, pollId, option] = interaction.customId.split("_");
      const message = await interaction.channel.messages.fetch(interaction.message.id);
      const embed = message.embeds[0];
      const description = embed.description.split("\n");
      const optionI = Number(option);
      const line = description[optionI];
      const match = line.match(/(\d+)票/);
      const currentVotes = match ? parseInt(match[1]) : 0;
      const newVotes = currentVotes + 1;
      description[optionI] = line.replace(/(\d+)票/, `${newVotes}票`);
      const newEmbed = EmbedBuilder.from(embed)
        .setDescription(description.join("\n"));
      await interaction.update({
        embeds: [newEmbed]
      });
    }
  },


  {
    name: "bothelp",
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("Botヘルプ")
        .setDescription("このbotはJavaScriptで作られたbotだよ！\n雑ですがソースコードはこちら\nhttps://github.com/souchan2525/souchanbot2/")
        .setColor("LightGrey");

      await interaction.reply({
        ephemeral: true,
        embeds: [embed]
      });
    }
  },

]

//  スラッシュコマンド登録
const rest = new REST({ version: "10" }).setToken(process.env.token);

//  コマンド実行
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const base = interaction.customId.split("_")[0];

  // commandhelp_1 → commandhelp_page に変換
  const name = base === "commandhelp" && interaction.customId.includes("_")
    ? "commandhelp_page"
    : base === "poll" && interaction.customId.startsWith("poll_")
    ? "poll_vote"
    : base;

  const button = buttons.find(b => b.name === name);
  if (!button) return;

  try {
    await button.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      return interaction.reply({
        content: "権限が足りないよ！",
        ephemeral: true
      });
    }
    console.error(err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.find(c => c.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return;
    }
    console.error(err);
  }
});

client.on("messageCreate", async message => {
  try {
    if (message.author.bot || !message.guild) return;
    if (message.content.startsWith("!")) return;
    const userId = String(message.author.id);
    let addMoney = ((message.content?.length ?? 0) - 5) * 15;
    if (message.content?.length < 5) addMoney = 0;
    if (addMoney > 200) addMoney = 200;
    if (addMoney === 0) return;

    const { data, error } = await supabase
      .from("userinfo")
      .select("money")
      .eq("userid", userId)
      .single();

    if (error) {
      console.error("Select Error:", error);
      return;
    }

    const newBalance = Number(data.money) + addMoney;

    const { error: upsertError } = await supabase
      .from("userinfo")
      .upsert({
        userid: userId,
        money: newBalance
      })
      .eq("userid", userId);

    if (upsertError) console.error("Update Error:", upsertError);
  } catch (err) {
    if (err.code === 50013) {
      interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return;
    }
    console.error(err);
  }
});

client.on("messageCreate", async message => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith("!message ")) {
      const text = message.content.split(" ")[1]
      await message.delete()
      await message.channel.send(text)
    }
  } catch (err) {
    if (err.code === 50013) {
      interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return;
    }
    console.error(err);
  }
})

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(3000, () => {
  console.log("Web server is running on port 3000");
});

client.once("clientReady", async () => {
  console.log("Botが起動したよ！");
  await loadCommandPages(client);
});

//  ログイン
client.login(process.env.token);





