import { archiveRaws } from '@app/services/raws'
import Queue from '@core/objects/queue'

const archiveRawsCron = new Queue({
  queue: 'cron',
  name: 'archive_raws',
  cron: '0 1 0 * * *',
  processor: archiveRaws
})

export default archiveRawsCron
