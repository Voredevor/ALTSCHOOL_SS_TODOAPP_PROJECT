const winston = require("winston");

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL, 
    format: winston.format.combine (
        winston.format.timestamp(),
        winston.format.printf( info => [ ${info.timestamp} ${info.level.toUpperCase()}: ${info.message}]) 
    ),
    transports: [
        new winston.transport.Console()
    ]
}); 

// Morgan Stream set up 
logger.stream = {
    write: message => logger.info(message.trim())
}; 

module.exports = logger; 