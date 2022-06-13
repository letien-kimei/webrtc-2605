const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');
const path = require('path');
// const logger = winston.createLogger({
//       format: winston.format.combine(
//       winston.format.prettyPrint(),
//       winston.format.splat(),
//       winston.format.printf((info) => {
//         console.log("=========== TYPE =============")
//         console.log(info.message)
//         if (typeof info.message === 'object') {
//           info.message = JSON.stringify(info.message, null, 3)
//         }
//         return info.message
//       })
//     ),
//    level: 'debug',
//    transports: [
//       new winston.transports.Console({level: 'silly',}),
//       new winston.transports.File({filename: './src/logs/data.log', level: 'info'})
//    ]
// })

const logger = (fileName = 'data.log')=>{
  let temp =  winston.createLogger({
                  format: winston.format.combine(
                  winston.format.prettyPrint(),
                  winston.format.splat(),
                  winston.format.printf((info) => {
                    console.log("=========== TYPE =============")
                    console.log(info.message)
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
    return temp
} 

module.exports = logger