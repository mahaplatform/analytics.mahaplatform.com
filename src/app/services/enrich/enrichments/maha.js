import URL from 'url'
import qs from 'qs'

const getArgs = (event) => {
  const url = URL.parse(event.page_url)
  return url.search ? qs.parse(url.search.substr(1)) : {}
}

const getParams = (event) => {
  if(!event.event || event.event !== 'track_maha') return {}
  const { key, value } = event.unstruct_event.data.data
  return {
    [key]: value
  }
}

const mahaEnrichment = async(req, event) => {

  const args = getArgs(event)

  const params = getParams(event)

  return {
    ...event,
    user_id: event.user_id || args.cid || null,
    email_campaign_id: args.ecid || null,
    email_id: args.eid || null,
    form_id: params.form_id || null,
    response_id: params.response_id || null,
    event_id: params.event_id || null,
    registration_id: params.registration_id || null,
    store_id: params.store_id || null,
    order_id: params.order_id || null,
    website_id: params.website_id || null
  }

}

export default mahaEnrichment
