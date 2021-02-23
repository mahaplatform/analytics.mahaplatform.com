import '@core/services/environment'
import log from '@core/utils/log'
import path from 'path'

const start = (name) => {
  const queue = require(path.join(__dirname,'app','cron',`${name}_cron.js`)).default
  log('info', 'cron', `Starting ${queue.name}`)
  queue.start()
}

const processor = async () => {
  start('archive_raws')
  start('update_maxmind')
}

processor()
