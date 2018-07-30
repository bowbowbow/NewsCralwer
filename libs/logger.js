const winston = require('winston');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const debugLogPath = path.join(__dirname, '../logs/debug.log');
const errorLogPath = path.join(__dirname, '../logs/error.log');

/**
 * Log Level
 * { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
 */


const format = winston.format.combine(
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.prettyPrint(),
  winston.format.printf(info => {
    return `${moment(info.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${info.level}: ${info.message}`;
  }),
);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      name: 'info-console',
      level: 'info',
      format,
    }),
    new winston.transports.File({
      name: 'debug-file',
      level: 'debug',
      maxsize: 10000000,
      filename: debugLogPath,
      format,
    }),
    new winston.transports.File({
      name: 'error-file',
      level: 'error',
      maxsize: 10000000,
      filename: errorLogPath,
      format,
    }),
  ],
});

logger.setLevels(winston.config.syslog.levels);
logger.exitOnError = false;

module.exports = logger;
