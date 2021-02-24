import { updateDatabase } from '@app/services/maxmind'
import Queue from '@core/objects/queue'

const updateMaxmindCron = new Queue({
  queue: 'analytics_cron',
  name: 'update_maxmind',
  cron: '0 0 * * *',
  processor: updateDatabase
})

export default updateMaxmindCron
