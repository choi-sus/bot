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

const fs = require("fs");
const path = require("path");

// 파일 경로 설정
const stateFilePath = path.join(__dirname, "state.json");

// 상태를 저장할 파일을 읽어오는 함수
function readStateFile() {
  try {
    const fileContent = fs.readFileSync(stateFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading state file:", error.message);
    return { lastSentIndex: -1 };
  }
}

// 상태를 저장하는 함수
function writeStateFile(state) {
  try {
    const stateJSON = JSON.stringify(state);
    fs.writeFileSync(stateFilePath, stateJSON, "utf-8");
  } catch (error) {
    console.error("Error writing state file:", error.message);
  }
}

// 기존 상태 읽어오기
let state = readStateFile();

client.login(process.env.DISCORD_TOKEN);

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  // 매일 7사에 실행되도록 스케줄링
  cron.schedule("56 14 * * *", () => {
    // 다음에 보낼 인덱스 계산
    const nextIndex = state.lastSentIndex + 1;

    // 배열의 끝까지 메시지를 보냈으면 처음부터 다시 시작
    const currentIndex = nextIndex >= fortuneMessages.length ? 0 : nextIndex;

    sendFortuneMessage();

    // 상태 업데이트
    state.lastSentIndex = currentIndex;
    writeStateFile(state);
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
  const fortuneMessage = fortuneMessages[state.lastSentIndex + 1];

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
