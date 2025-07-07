const winston = require("winston");
const path = require("node:path");
const fs = require("node:fs");

// Ensure the logs directory exists
const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create a Winston logger
const logger = winston.createLogger({
  level: "info", // Minimum level of logs to store
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
  ],
});

module.exports = logger;
