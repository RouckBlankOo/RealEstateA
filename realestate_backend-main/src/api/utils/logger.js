const winston = require("winston");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "payment-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) =>
            `${info.timestamp} ${info.level}: ${info.message} ${
              info.stack ? "\n" + info.stack : ""
            } ${
              Object.keys(info).filter(
                (key) =>
                  ![
                    "timestamp",
                    "level",
                    "message",
                    "stack",
                    "service",
                  ].includes(key)
              ).length > 0
                ? "\n" +
                  JSON.stringify(
                    Object.entries(info).reduce((acc, [key, value]) => {
                      if (
                        ![
                          "timestamp",
                          "level",
                          "message",
                          "stack",
                          "service",
                        ].includes(key)
                      ) {
                        acc[key] = value;
                      }
                      return acc;
                    }, {})
                  )
                : ""
            }`
        )
      ),
    }),
  ],
});

module.exports = logger;
