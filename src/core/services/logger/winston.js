import { createLogger, format, transports } from 'winston'
import chalk from 'chalk'
import path from 'path'
import ejs from 'ejs'
import fs from 'fs'

const template = fs.readFileSync(path.join(__dirname, 'log.ejs'), 'utf8')

const logger = createLogger({
  level: 'info',
  format: format.printf(data => {
    return ejs.render(template, {
      data,
      chalk
    })
  }),
  transports: [
    new transports.Console({
      level: 'info'
    })
  ]
})

export default logger
