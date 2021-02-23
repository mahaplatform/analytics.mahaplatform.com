import Validate from '@app/services/validate'
import Queue from '@core/objects/queue'

const ValidateQueue = new Queue({
  queue: 'analytics',
  name: 'validate',
  processor: Validate
})

export default ValidateQueue
