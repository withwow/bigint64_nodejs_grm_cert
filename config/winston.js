const appRoot = require('app-root-path');
const winston = require('winston');
const process = require('process');

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] ${message}`;
});

const options = {
    file: {
        level: 'debug',
        filename: `${appRoot}/logs/trace.log`,
        handleExceptions: true,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        format: combine(
            timestamp(),
            myFormat
        ),
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        format: combine(
            timestamp(),
            myFormat
        ),
    },
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
    ],
    exitOnError: false,
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console(options.console));
}

// 기존 로직에서 require('../config/winston')으로 사용할 수 있도록 수출
module.exports = logger;