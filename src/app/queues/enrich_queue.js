import Queue from '@core/objects/queue'

const EnrichQueue = new Queue({
  queue: 'analytics',
  name: 'enrich',
  processor: async (req, job) => {}
})

export default EnrichQueue
