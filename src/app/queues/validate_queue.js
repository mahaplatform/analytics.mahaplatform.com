import validate from '@app/services/validate'
import Queue from '@core/objects/queue'

const ValidateQueue = new Queue({
  queue: 'analytics_worker',
  name: 'validate',
  processor: validate
})

export default ValidateQueue
