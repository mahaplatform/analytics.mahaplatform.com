import URL from 'url'

const campaignEnrichment = async(req, event) => {

  if(!event.page_url) return event

  const url = URL.parse(data.url)



  return {
    ...event,
    mkt_medium: null,
    mkt_source: null,
    mkt_term: null,
    mkt_content: null,
    mkt_campaign: null
  }

}

export default campaignEnrichment
