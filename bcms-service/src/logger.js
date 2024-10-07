let morgan = require('morgan');
let winston = require('winston');
let path = require('path');
require('winston-daily-rotate-file');

// 日志打印位置
const LOGS_DIR = path.join(__dirname, '../logs');
// 每天生成一个日志文件，一个文件最大 10M

const accessTransport = new winston.transports.DailyRotateFile({
    name: 'access',
    level: 'info',
    datePattern:'YYYY-MM-DD',
    filename: LOGS_DIR + '/access-%DATE%.log',
    prepend: true,
    maxsize: 1024 * 1024 * 10,
    colorize: false,
    json: false,
    handleExceptions: true,
});

var errorTransport = new winston.transports.DailyRotateFile({
    name: 'error',
    level: 'error',
    datePattern:'YYYY-MM-DD',
    filename: LOGS_DIR + '/error-%DATE%.log',
    prepend: true,
    maxsize: 1024 * 1024 * 10,
    colorize: false,
    json: false,
    handleExceptions: true,
});

/**
 * error 错误严重时记录
 */
let logger = winston.createLogger ({
    transports: [
        errorTransport
    ],
    exitOnError: false,
});
/**
 * 打印 Access Log 使用
 * 不输出到控制台中
 */
let accessLogger = winston.createLogger ({
    transports: [
        accessTransport
    ],
    exitOnError: false,
});
// 提供 morgan 使用
logger.stream = {
    write: function(message) {
        accessLogger.info(message.trim()); // trim 去除多余换行
    }
};

morgan.token('localDate',function getDate(req) {
    let date = new Date();
    return date.toLocaleString()
})
morgan.format('combined', ':remote-addr - :remote-user [:localDate]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');


/**
 * 日志处理对象
 */
let Logger = {
    // 初始化 morgan 记录请求记录
    initRequestLogger: function(app) {
        app.use(
            morgan('combined', {
                'stream': logger.stream,
                // OPTIONS 类型请求不记录在日志中
                'skip': (req, res) => req.method === 'OPTIONS'
            })
        );
    },
    // 错误日志并记录行号
    error: function() {
        logger.error.apply(
            logger,
            [
                ...arguments,
                {
                    time: new Date().toLocaleString()
                }
            ]
        );
    },
};
module.exports = Logger;