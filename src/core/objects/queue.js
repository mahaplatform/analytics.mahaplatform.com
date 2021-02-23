import createRedisClient from '@core/utils/create_redis_client'
import * as knex from '@core/services/knex'
import Bull from 'bull'

const queues = {}

const getQueue = (name) => {
  if(queues[name]) return queues[name]
  queues[name] = new Bull(name, {
    createClient: createRedisClient
  })
  return queues[name]
}

const getConcurrency = (name) => {
  return queues[name] === undefined ? 10 : 0
}

class Queue {

  constructor(options) {
    this.processor = this._getProcessor(options.processor, options.log)
    this.completed = this._getCompleted(options.completed)
    this.failed = this._getFailed(options.failed)
    this.concurrency = getConcurrency(options.queue)
    this.priority = options.priority || 10
    this.attempts = options.attempts || 3
    this.remove = options.remove || true
    this.queue = getQueue(options.queue)
    this.queueName = options.queue
    this.refresh = options.refresh
    this.name = options.name
    this.cron = options.cron
    this.path = options.path
  }

  async enqueue(req = {}, job = {}, options = {}) {
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
    return await this.queue.add(this.name, job, {
      priority: this.priority,
      delay: 2000,
      attempts: this.attempts,
      repeat: this.cron ? { cron: this.cron } : null,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: this.remove
    })
  }

  async start() {
    this.queue.process(this.name, this.concurrency, this.processor)
    if(this.cron) await this.startCron()
  }

  async startCron() {
    const jobs = await this.queue.getRepeatableJobs()
    await Promise.mapSeries(jobs, async(job) => {
      if(job.name !== this.name) return
      await this.queue.removeRepeatableByKey(job.key)
    })
    this.enqueue()
  }

  _getProcessor(processor, log = true) {
    const withtransaction = this._withTransaction(processor)
    return this._withCallbacks(withtransaction)
  }

  _getCompleted(completed) {
    if(!completed) return () => {}
    return completed
  }

  _getFailed(failed) {
    return async(job, err) => {
      if(failed) await failed(job, err)
    }
  }

  _withCallbacks(processor) {
    return async (job) => {
      try {
        await processor(job)
        await this.completed()
      } catch(err) {
        await this.failed(job, err)
        throw err
      }
    }
  }

  _withTransaction(processor) {
    return async (job) => {
      return knex.analytics.transaction(async analytics => {
        const req = {}
        req.analytics = analytics
        await processor(req, job)
      })
    }
  }

}

export default Queue
