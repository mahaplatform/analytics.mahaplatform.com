import enrich from '@app/services/enrich'
import Queue from '@core/objects/queue'

const EnrichQueue = new Queue({
  queue: 'analytics_worker',
  name: 'enrich',
  processor: enrich
})

export default EnrichQueue
