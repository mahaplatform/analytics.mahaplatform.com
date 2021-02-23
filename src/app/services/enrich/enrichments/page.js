const pageEnrichment = async(req, event) => {

  if(!event.page_url) return event

  return {
    ...event,
    page_urlscheme: null,
    page_urlhost: null,
    page_urlport: null,
    page_urlpath: null,
    page_urlquery: null,
    page_urlfragment: null
  }

}

export default pageEnrichment
