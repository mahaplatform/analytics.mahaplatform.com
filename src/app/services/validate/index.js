import EnrichQueue from '@app/queue/enrich_queue'
import validations from './validations'
import Raw from '@app/models/raw'

const validate = async (req, job) => {

  const raw = await Raw.query(qb => {
    qb.where('id', job.data.id)
  }).fetch({
    transacting: req.analytics
  })

  try {

    await Promise.mapSeries(validations, async (valid, validation) => {
      return await validation(req, raw.get('data'))
    })

    await raw.save({
      status: 'validated'
    },{
      transacting: req.analytics,
      patch: true
    })

    await EnrichQueue.enqueue(req, {
      id: raw.get('id')
    })

  } catch(error) {

    return await raw.save({
      status: 'invalid'
    },{
      transacting: req.analytics,
      patch: true
    })

  }

}

export default validate
