import EnrichQueue from '@app/queues/enrich_queue'
import validations from './validations'
import Raw from '@app/models/raw'

const validate = async (req, job) => {

  const raw = await Raw.query(qb => {
    qb.where('id', job.data.id)
  }).fetch({
    transacting: req.analytics
  })

  try {

    const is_valid = await Promise.reduce(validations, async (is_valid, validation) => {
      if(!is_valid) return false
      return await validation(req, raw.get('data'))
    }, true)

    await raw.save({
      is_valid,
      status: 'processed'
    },{
      transacting: req.analytics,
      patch: true
    })

    if(is_valid) {
      await EnrichQueue.enqueue(req, {
        id: raw.get('id')
      })
    }

  } catch(error) {

    await raw.save({
      validation_status: 'failed',
      error: error.stack
    },{
      transacting: req.analytics,
      patch: true
    })

  }

}

export default validate
