import EnrichQueue from '@app/queue/enrich_queue'
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
    }, event)

    await raw.save({
      enriched: {
        enriched,
        collector_tstamp: raw.get('created_at').format('YYYY-MM-DD HH:mm:ss.SSS'),
        etl_timetamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS')
      }
    },{
      transacting: req.analytics,
      patch: true
    })

  } catch(err) {

    await raw.save({
      status: 'failed'
    },{
      transacting: req.analytics,
      patch: true
    })

    await EnrichQueue.enqueue(req, {
      id: raw.get('id')
    })

  }

}

export default enrich
