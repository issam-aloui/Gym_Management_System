const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure the logs directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
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
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
  ],
});

module.exports = logger;
