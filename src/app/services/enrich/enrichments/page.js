const pageEnrichment = async(req, event) => {

  if(!event.page_url) return event

  const url = URL.parse(event.page_url)

  return {
    ...event,
    page_urlscheme: url.protocol.slice(0, -1),
    page_urlhost: url.hostname,
    page_urlport: url.port,
    page_urlpath: url.pathname,
    page_urlquery: url.search.substr(1),
    page_urlfragment: url.hash.substr(1)
  }

}

export default pageEnrichment
