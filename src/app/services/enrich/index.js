import ModelQueue from '@app/queue/model_queue'
import enrichments from './enrichments'
import Raw from '@app/models/raw'
import parseEvent from './event'
import moment from 'moment'

const enrich = async (req, job) => {

  const raw = await Raw.query(qb => {
    qb.where('id', job.data.id)
  }).fetch({
    transacting: req.analytics
  })

  try {

    const event = parseEvent(req, {
      data: raw.get('row')
    })

    const enriched = await Promise.reduce(enrichments, async (enrichment, enriched) => {
      return await enrichment(req, enriched)
    }, {
      event,
      collector_tstamp: raw.get('created_at').format('YYYY-MM-DD HH:mm:ss.SSS'),
      etl_timetamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
    })

    await raw.save({
      enriched,
      status: 'processed'
    },{
      transacting: req.analytics,
      patch: true
    })

    await ModelQueue.enqueue(req, {
      id: raw.get('id')
    })

  } catch(error) {

    await raw.save({
      status: 'failed',
      error: error.stack
    },{
      transacting: req.analytics,
      patch: true
    })

  }

}

export default enrich
