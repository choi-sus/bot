const { Client, Events, GatewayIntentBits } = require("discord.js");
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });

const cron = require("node-cron");

const dotenv = require("dotenv");
dotenv.config();

const fortuneMessages = [
  "운이 좋을 거에요!",
  "길거리에서 100원을 주웠을 때처럼 기뻐해봐요!",
  "오늘 하루도 행복하세요!",
];

let lastFortuneIndex = -1;

client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  // 매일 정오에 실행되도록 스케줄링
  cron.schedule("03 17 * * *", () => {
    sendFortuneMessage();
  });
});

const targetChannelIds = ["1194815059591958591", "1194913991135346770"];

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
  channel.send(`🥠 ${fortuneMessage}`);
}

function getRandomIndex() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * fortuneMessages.length);
  } while (randomIndex === lastFortuneIndex);

  lastFortuneIndex = randomIndex;
  return randomIndex;
}
