const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');
const path = require('path');


const logger = (fileName = 'data.log')=>{
  return new Promise((resolve, reject) => {
  let temp =  winston.createLogger({
                  format: winston.format.combine(
                  winston.format.prettyPrint(),
                  winston.format.splat(),
                  winston.format.printf((info) => {
                    if (typeof info.message === 'object') {
                      info.message = JSON.stringify(info.message, null, 3)
                    }
                    return info.message
                  })
                ),
                level: 'debug',
                transports: [
                  new winston.transports.Console({level: 'silly',}),
                  new winston.transports.File({filename: `./src/logs/${fileName}`, level: 'info'})
                ]
            })  
    resolve(temp)
  });
} 

module.exports = logger