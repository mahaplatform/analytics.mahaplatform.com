import '@core/services/environment'
import log from '@core/utils/log'
import path from 'path'

const start = (name) => {
  const queue = require(path.join(__dirname,'app','queues',`${name}_queue.js`))
  log('info', 'worker', `Starting ${queue.name}`)
  queue.start()
}

const processor = async () => {
  start('validate')
  start('enrich')
  start('model')
}

processor()
