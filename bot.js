require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder, 
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  ActivityType,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const e = require("express");
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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildWebhooks
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
        } catch { } // エラーなんて握りつぶしちゃえ！（雑）
      }
    }
  },

  {
    name: "help_button",
    async execute(interaction) {
      /*
      const help = new ButtonBuilder().setCustomId("commandhelp")
        .setLabel("コマンドヘルプ")
        .setStyle(ButtonStyle.Primary)
      */
      const help2 = new ButtonBuilder().setCustomId("bothelp")
        .setLabel("botヘルプ")
        .setStyle(ButtonStyle.Success)
      const help3 = new ButtonBuilder().setCustomId("boosthelp")
        .setLabel("ブーストヘルプ")
        .setStyle(ButtonStyle.Secondary)
      const help4 = new ButtonBuilder().setCustomId("emojihelp")
        .setLabel("絵文字ヘルプ")
        .setStyle(ButtonStyle.Secondary)
      const row = new ActionRowBuilder().addComponents(/*help, */help2, help3, help4)
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
      const serverid = interaction.guildId
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
        .setURL(`https://souchan-bot.pages.dev/timer/?sec=${time}`)
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
    name: "inventory",
    async execute(interaction) {
      const user = interaction.options.getString("user") ?? interaction.user.id;
      const { data, error } = await supabase
        .from("userinfo")
        .select("money")
        .eq("userid", user)
        .maybeSingle();
      if (error) {
        console.error(error);
        await interaction.reply({ content: "所持金の情報の取得に失敗しました...", ephemeral: true });
        return;
      }
      const { data: boost, error: boostError } = await supabase
        .from("userinfo")
        .select("total_boost")
        .eq("userid", user)
        .maybeSingle();
      if (boostError) {
        console.error(boostError);
        await interaction.reply({ content: "ブーストの情報の取得に失敗しました...", ephemeral: true });
        return;
      }
      let money = data ? data.money : 0;
      let total_boost = boost ? boost.total_boost : 0;
      if (money == null) money = 0;
      if (total_boost == null) total_boost = 0;
      const username = await interaction.client.users.fetch(user).catch(() => null);
      const embed = new EmbedBuilder()
        .setTitle(`${username ? username.username : user}さんの持ち物`)
        .setDescription(`
所持金💰: ${money}コイン
総ブースト数<:boost:1473607538426773525>: ${total_boost}
        `)
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
  },

  {
    name: "boost",
    async execute(interaction) {
      try {
        const form = new ButtonBuilder()
          .setCustomId("boost_confirm")
          .setLabel("ブーストする！")
          .setStyle(ButtonStyle.Success)
        const row = new ActionRowBuilder().addComponents(form);
        await interaction.reply({ content: "3000コインでブーストしますか？", ephemeral: true, components: [row] });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "ブーストに失敗しました..." });
      }
    }
  },

  {
    name: "boost_status",
    async execute(interaction) {
      try {
        let { data: boost, error } = await supabase
          .from("boost")
          .select("boost_num")
          .eq("serverid", interaction.guildId)
          .single();
        boost = boost.boost_num ?? 0;
        if (error) {
          console.error(error);
          await interaction.reply({ content: "ブーストの情報の取得に失敗しました...", ephemeral: true });
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle("ブースト状況")
          .setDescription(`現在のブースト数<:boost:1473607538426773525>: ${boost}`)
          .setColor("Gold")
          .setFooter({ text: "ブースト管理: supabase" })
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "ブーストの情報の取得に失敗しました...", ephemeral: true });
      }
    }
  },

  {
    name: "embedbuilder",
    async execute(interaction) {
      const { data: boost, error } = await supabase
        .from("boost")
        .select("boost_num")
        .eq("serverid", interaction.guildId)
        .single();
      if (error) {
        console.error(error);
        return await interaction.reply({
          content: "エラーが発生しました...",
          ephemeral: true
        });
      }
      const reboost = boost.boost_num ?? 0
      if (reboost < 14) {
        return await interaction.reply({
          content: "このサーバーのブースト数が14<:boost:1473607538426773525>未満のため、この機能は使用できません...", ephemeral: true
        })
      }
      const modal = new ModalBuilder()
        .setCustomId("embedbuilder_modal")
        .setTitle("埋め込み作成");
      const titleInput = new TextInputBuilder()
        .setCustomId("embed_title")
        .setLabel("タイトル")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const descriptionInput = new TextInputBuilder()
        .setCustomId("embed_description")
        .setLabel("説明")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);
      const footerInput = new TextInputBuilder()
        .setCustomId("embed_footer")
        .setLabel("フッター")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      const colorInput = new TextInputBuilder()
        .setCustomId("embed_color")
        .setLabel("カラーコード（例: #FF0000）")
        .setStyle(TextInputStyle.Short)
        .setMinLength(7)
        .setMaxLength(7)
        .setRequired(false);
      const row1 = new ActionRowBuilder().addComponents(titleInput);
      const row2 = new ActionRowBuilder().addComponents(descriptionInput);
      const row3 = new ActionRowBuilder().addComponents(colorInput);
      const row4 = new ActionRowBuilder().addComponents(footerInput);
      modal.addComponents(row1, row2, row3, row4);
      await interaction.showModal(modal);
    }
  },

  {
    name: "bot_emoji",
    async execute(interaction) {
      const { data: boost, error } = await supabase
        .from("boost")
        .select("boost_num")
        .eq("serverid", interaction.guildId)
        .single();
      const reboost = boost.boost_num ?? 0 
      if (reboost < 5) {
        await interaction.reply({ content: "このサーバーのブースト数が5<:boost:1473607538426773525>未満のため、この機能は使用できません...", ephemeral: true });
        return;
      }
      const name = interaction.client.emojis.cache
      if (!name.some(e => e.name === interaction.options.getString("emoji"))) {
        await interaction.reply({ content: "その絵文字は存在しません...", ephemeral: true });
        return;
      }
      await interaction.reply({ content: `<:${interaction.options.getString("emoji")}:${name.find(e => e.name === interaction.options.getString("emoji")).id}>` });
    }
  },

  {
    name: "custom_link",
    async execute(interaction) {
      const { data: boost, error: berror } = await supabase
        .from("boost")
        .select("boost_num")
        .eq("serverid", interaction.guildId)
        .single()
      const reboost = boost.boost_num ?? 0
      if (reboost < 27) {
        await interaction.reply({
          content: "このサーバーのブースト数が27<:boost:1473607538426773525>未満のため、この機能は使用できません...",
          ephemeral: true
        })
        return;
      }
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: "このコマンドを使用するには管理者権限が必要です！", ephemeral: true });
        return;
      }
      const name = interaction.options.getString("name");
      const url = interaction.options.getString("url") ?? (await interaction.guild.invites.create(interaction.channelId, {
          maxAge: 0,
          maxUses: 0,
          unique: true,
        })).url;
      const key = interaction.options.getString("key")
      const { error: inserterror } = await supabase
        .from("link")
        .insert({
          "name": name,
          "key": key,
          "link": url,
        })
      if (inserterror) {
        await interaction.reply({ content: "この名前はもう使われているよ！", ephemeral: true })
        return
      }
      const embed = new EmbedBuilder()
        .setTitle("カスタム招待リンク")
        .setDescription(`https://souchan-bot.pages.dev/invite/?link=${name}`)
      const button = new ButtonBuilder()
        .setLabel("アクセスボタン")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://souchan-bot.pages.dev/invite/?link=${name}`)
      const row = new ActionRowBuilder().addComponents(button)
      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  },

  {
    name: "work",
    async execute(interaction) {
      const { data: time, error: timeerror } = await supabase
        .from("userinfo")
        .select("work_interval")
        .eq("userid", interaction.user.id)
        .single();
      const retime = time?.work_interval ?? 0;
      if (retime - Date.now() > 0) {
        const retimemin = String(Math.ceil((retime - Date.now()) / 60000) - 1) + "分";
        const retimesec = String(Math.ceil((retime - Date.now()) % 60000 / 1000)) + "秒";
        const embed1 = new EmbedBuilder()
          .setTitle("クールダウン中...")
          .setDescription(`workは${retimemin}${retimesec}後に再度試すことができます！`)
          .setColor("Red")
        await interaction.reply({ embeds: [embed1], ephemeral: true });
        return;
      }
      const { error: tuperr } = await supabase
        .from("userinfo")
        .update({
          work_interval: Date.now() + 600000
        })
        .eq("userid", interaction.user.id)
      if (tuperr) {
        console.error(tuperr);
        await interaction.reply({ content: "エラーが発生しました...", ephemeral: true });
        return;
      }
      const money = await supabase
        .from("userinfo")
        .select("money")
        .eq("userid", interaction.user.id)
        .single()
      const addMoney = Math.floor(Math.random() * 1000) + 500;
      const newMoney = (money.data?.money ?? 0) + addMoney;
      const { error } = await supabase
        .from("userinfo")
        .upsert({
          userid: interaction.user.id,
          money: newMoney
        })
        .eq("userid", interaction.user.id)
      if (error) {
        console.error(error);
        await interaction.reply({ content: "エラーが発生しました...", ephemeral: true });
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle("お仕事完了！")
        .setDescription(`${addMoney}コインを手に入れたよ！\n現在の所持金: ${newMoney}コイン`)
        .setColor("Gold")
        .setFooter({ text: "所持金管理: supabase" })
      await interaction.reply({ embeds: [embed] });
    }
  }
];

/*
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
*/

const buttons = [
/*
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
*/
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

  {
    name: "boosthelp",
    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("ブーストヘルプ")
        .setDescription(`
5ブースト: bot内絵文字(/emoji)の使用権
14ブースト: 埋め込み作成コマンド(/embedbuilder)の使用権
27ブースト: カスタム招待リンク(/custom_link)の使用権
        `)
        .setColor("LightGrey");
      await interaction.reply({
        ephemeral: true,
        embeds: [embed]
      });
    }
  },

  {
    name: "emojihelp",
    async execute(interaction) {
      const reload = await interaction.guild.emojis.fetch();
      const emojis = interaction.client.emojis.cache.map(e => e.name);
      const embed = new EmbedBuilder()
        .setTitle("絵文字ヘルプ")
        .setDescription(`使える絵文字: \n${emojis.map(e => `\`${e}\``).join("\n")}
同じ名前の場合、上にあるものが優先されるよ！`)
        .setColor("LightGrey");
      await interaction.reply({
        ephemeral: true,
        embeds: [embed]
      });
    }
  },

  {
    name: "boost_confirm",
    async execute(interaction) {
      try {
        // 所持金取得
        let { data: moneyData, error: uerror } = await supabase
          .from("userinfo")
          .select("money")
          .eq("userid", interaction.user.id)
          .single();

        const money = moneyData?.money ?? 0;

        if (money < 3000) {
          return interaction.reply({
            content: "所持金が足りません！",
            ephemeral: true
          });
        }

        // サーバーブースト数取得
        let { data: boostData, error: berror } = await supabase
          .from("boost")
          .select("boost_num")
          .eq("serverid", interaction.guildId)
          .single();

        const boost = boostData?.boost_num ?? 0;

        // ユーザーの総ブースト数取得
        let { data: myboostData, error: mberror } = await supabase
          .from("userinfo")
          .select("total_boost")
          .eq("userid", interaction.user.id)
          .single();

        const myboost = myboostData?.total_boost ?? 0;

        // サーバーブースト更新
        const { error: userror } = await supabase
          .from("boost")
          .upsert({
            serverid: interaction.guildId,
            boost_num: boost + 1
          });

        // ユーザーの所持金 & 総ブースト更新
        const { error: userror2 } = await supabase
          .from("userinfo")
          .upsert({
            userid: interaction.user.id,
            money: money - 3000,
            total_boost: myboost + 1
          });

        const embed = new EmbedBuilder()
          .setTitle("ブースト！")
          .setDescription(`現在のブースト数<:boost:1473607538426773525>: ${boost + 1}`)
          .setColor("Gold")
          .setFooter({ text: "ブースト管理: supabase" });

        await interaction.reply({ embeds: [embed] });

      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "ブーストに失敗しました..." });
      }
    }
  },
]

const modals = [
  {
    name: "embedbuilder_modal",
    async execute(interaction) {
      const title = interaction.fields.getTextInputValue("embed_title");
      const description = interaction.fields.getTextInputValue("embed_description");
      const footer = interaction.fields.getTextInputValue("embed_footer");
      const color = interaction.fields.getTextInputValue("embed_color") || "#FFFFFF";

      // カラーコードが不正ならデフォルトにする
      const validColor = /^#?[0-9A-Fa-f]{6}$/.test(color)
        ? color.replace("#", "")
        : "FFFFFF";

      const embed = new EmbedBuilder()
        .setTitle(title ?? null)
        .setDescription(description ?? null)
        .setColor(`#${validColor}`)
        .setFooter({ text: footer ?? null });
      await interaction.reply({ embeds: [embed] });
    }
  }
]

//  スラッシュコマンド登録
const rest = new REST({ version: "10" }).setToken(process.env.token);

//  コマンド実行
// ボタンの実行
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  // const base = interaction.customId.split("_")[0];

  // commandhelp_1 → commandhelp_page に変換
  const name = /* base === "commandhelp" && interaction.customId.includes("_")
    ? "commandhelp_page"
    : base === "poll" && interaction.customId.startsWith("poll_")
      ? "poll_vote"
      : */ interaction.customId

  const button = buttons.find(b => b.name === name);
  if (!button) return;

  try {
    await button.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      return await interaction.reply({
        content: "権限が足りないよ！",
        ephemeral: true
      });
    }
    console.error(err);
  }
});

// スラッシュコマンド実行
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = commands.find(c => c.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      await interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return;
    }
    console.error(err);
  }
});

// モーダルの送信を受け取る
client.on("interactionCreate", async interaction => {
  if (!interaction.isModalSubmit()) return;
  const modal = modals.find(c => c.name === interaction.customId)
  if (!modal) return;
  try {
    await modal.execute(interaction);
  } catch (err) {
    if (err.code === 50013) {
      await interaction.reply({
        content: "権限が足りないよ！", ephemeral: true
      })
      return
    }
    console.error(err)
  }
});

// メッセージを送るたびにお金がもらえる機能（スパム対策のため5文字以上で、最大200コインまで）
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

// メッセージコマンド
client.on("messageCreate", async message => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith("!message ")) {
      const text = message.content.replace("!message ", "")
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
  setInterval(() => {
    const server = client.guilds.cache.size
    client.user.setActivity(`${server}サーバーに導入中...`, {
      type: ActivityType.Watching
    })
  })
  // await loadCommandPages(client);
});

//  ログイン
client.login(process.env.token);


