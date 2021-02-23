const referrerEnrichment = async(req, event) => {

  if(!event.page_referrer) return event

  return {
    ...event,
    refr_urlscheme: null,
    refr_urlhost: null,
    refr_urlport: null,
    refr_urlpath: null,
    refr_urlquery: null,
    refr_urlfragment: null,
    refr_medium: null,
    refr_source: null,
    refr_term: null
  }

}

export default referrerEnrichment
