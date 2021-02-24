import model from '@app/services/model'
import Queue from '@core/objects/queue'

const ModelQueue = new Queue({
  queue: 'analytics_worker',
  name: 'model',
  processor: model
})

export default ModelQueue
