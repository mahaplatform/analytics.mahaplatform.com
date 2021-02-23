import Queue from '@core/objects/queue'

const ModelQueue = new Queue({
  queue: 'analytics',
  name: 'model',
  processor: async (req, job) => {}
})

export default ModelQueue