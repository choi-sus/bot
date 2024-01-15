const {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });

const fortuneMessages = require("./fortuneMessages");

const cron = require("node-cron");

const dotenv = require("dotenv");
dotenv.config();

let lastFortuneIndex = -1;

client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  // 매일 정오에 실행되도록 스케줄링
  cron.schedule("03 14 * * *", () => {
    sendFortuneMessage();
  });
});

const targetChannelIds = ["1194815059591958591"];

function sendFortuneMessage() {
  const guilds = Array.from(client.guilds.cache.values());

  guilds.forEach((guild) => {
    const textChannels = guild.channels.cache
      .filter(
        (channel) => channel.type === 0 && targetChannelIds.includes(channel.id)
      )
      .filter((channel) =>
        channel.permissionsFor(client.user).has("SEND_MESSAGES")
      );

    textChannels.forEach((channel) => {
      sendFortuneMessageToChannel(channel);
    });
  });
}

function sendFortuneMessageToChannel(channel) {
  const randomIndex = getRandomIndex();
  const fortuneMessage = fortuneMessages[randomIndex];

  const embed = new EmbedBuilder()
    .setColor("#ffb2a5")
    .setTitle("⋆。˚ ♡ ₊˚ ෆᕱ⑅ᕱෆ ₊˚ ♡ ˚ 。⋆")
    .setDescription(`${fortuneMessage}`)
    .setTimestamp()
    .setFooter({
      text: "🍀 당신의 수호천사",
      iconURL:
        "https://cdn.discordapp.com/attachments/1194815059591958591/1196313785753948220/image.png?ex=65b72d08&is=65a4b808&hm=9526cc3c293977d3ae0c946605d611f4c3c7495a30e6de0df53b602e9f9c4353&",
    });

  channel.send({ embeds: [embed] });
}

function getRandomIndex() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * fortuneMessages.length);
  } while (randomIndex === lastFortuneIndex);

  lastFortuneIndex = randomIndex;
  return randomIndex;
}
