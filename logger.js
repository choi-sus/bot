const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");
// 로그를 일자별로 생성하여 준다.
const process = require("process");

const { combine, label, timestamp, printf } = winston.format;
// level 로그의 종류

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level} : ${message}`;
  // 로그 출력 포맷
});

const logDir = "logs";
// 로그를 저장한 폴더명

/**
 * log Level
 */
const logger = winston.createLogger({
  format: combine(
    label({
      // 해당 로그의 명칭을 설정하는 것이다.
      label: "System Name",
    }),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat // 로그 출력 포맷
  ),
  transports: [
    // 로그를 어떤 식으로 기록할 것인지
    // info 레벨의 로그를 저장할 파일 설정
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: "%Date%.log",
      maxFiles: 30,
      zippedArchive: true,
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: "%DATE%.error.log",
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    //uncaughtException 발생시
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: "%DATE%.exception.log",
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

// production 환경이 아닌 경우 (개발 단계 등)
if (process.env.NODE_ENV !== "production") {
  // 게발 환경인 경우에는 바로 바로 확인할 수 있게 console.log를 추가
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        // 색깔 넣어서 출력
        winston.format.simple()
        // winston에서 제공되는 기본 format을 사용
      ),
    })
  );
}

module.exports = logger;
