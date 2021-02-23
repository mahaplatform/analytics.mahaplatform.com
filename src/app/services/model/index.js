import { getDomainUser } from './domain_users'
import { getEventType } from './event_types'
import Raw from '@apps/analytics/models/raw'
import { getSession } from './sessions'
import { createEvent } from './events'
import { parseUrl } from './urls'

export const model = async(req, { id }) => {

  const raw = await Raw.query(qb => {
    qb.where('id', id)
  }).fetch({
    transacting: req.analytics
  })

  try {

    const data = raw.get('enriched')

    const page_url = data.page_url ? parseUrl(data.page_url) : null

    const domain_user = await getDomainUser(req, {
      data,
      page_url
    })

    const event_type = await getEventType(req, { data })

    const session = await getSession(req, {
      domain_user,
      event_type,
      data,
      page_url
    })

    await createEvent(req, {
      session,
      event_type,
      data,
      page_url
    })

    await raw.save({
      status: 'processed'
    }, {
      transacting: req.analytics,
      patch: true
    })

  } catch(error) {

    await raw.save({
      modeling_status: 'failed',
      error: error.stack
    }, {
      transacting: req.analytics,
      patch: true
    })

  }

}

export default model
