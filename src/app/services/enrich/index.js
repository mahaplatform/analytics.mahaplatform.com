import enrichments from './enrichments'
import Raw from '@app/models/raw'
import atob from 'atob'

const parsedim = (dim) => {
  const parts = dim ? dim.split('x') : [null,null]
  return {
    width: parts[0],
    height: parts[1]
  }
}

const enrich = async (req, job) => {

  const raw = await Raw.query(qb => {
    qb.where('id', job.data.id)
  }).fetch({
    transacting: req.analytics
  })

  const data = raw.get('row')

  const context = JSON.parse(atob(data.cx))

  const events = {
    pv: 'page_view',
    pp: 'page_ping',
    tr: 'transaction',
    ti: 'transaction_item',
    se: 'struct',
    ue: 'unstruct'
  }

  const doc = parsedim(data.ds)

  const device = parsedim(data.res)

  const viewport = parsedim(data.vp)

  const event = {
    app_id: data.aid,
    platform: data.p,
    etl_timestamp: null,
    collector_tstamp: null,
    dvce_created_tstamp: data.dtm,
    event: events[data.e],
    event_id: data.eid,
    txn_id: data.transaction_id,
    name_tracker: data.tna,
    v_tracker: data.tv,
    v_collector: null,
    v_etl: null,
    user_id: data.uid,
    user_ipaddress: null,
    user_fingerprint: null,
    domain_userid: data.duid,
    domain_sessionidx: data.vid,
    network_userid: null,
    ip_isp: null,
    ip_organization: null,
    ip_domain: null,
    ip_netspeed: null,
    page_url: data.url,
    page_title: data.page,
    page_referrer: data.refr,
    mkt_medium: null,
    mkt_source: null,
    mkt_term: null,
    mkt_content: null,
    mkt_campaign: null,
    contexts: null,
    se_category: null,
    se_action: null,
    se_label: null,
    se_property: null,
    se_value: null,
    unstruct_event: null,
    tr_orderid: null,
    tr_affiliation: null,
    tr_total: null,
    tr_tax: null,
    tr_shipping: null,
    tr_city: null,
    tr_state: null,
    tr_country: null,
    ti_orderid: null,
    ti_sku: null,
    ti_name: null,
    ti_category: null,
    ti_price: null,
    ti_quantity: null,
    pp_xoffset_min: null,
    pp_xoffset_max: null,
    pp_yoffset_min: null,
    pp_yoffset_max: null,
    useragent: null,
    br_name: null,
    br_family: null,
    br_version: null,
    br_type: null,
    br_renderengine: null,
    br_lang: data.lang,
    br_features_pdf: null,
    br_features_flash: null,
    br_features_java: null,
    br_features_director: null,
    br_features_quicktime: null,
    br_features_realplayer: null,
    br_features_windowsmedia: null,
    br_features_gears: null,
    br_features_silverlight: null,
    br_cookies: data.cookie,
    br_colordepth: data.cd,
    br_viewwidth: viewport.width,
    br_viewheight: viewport.height,
    os_name: null,
    os_family: null,
    os_manufacturer: null,
    os_timezone: data.tz,
    dvce_type: null,
    dvce_ismobile: null,
    dvce_screenwidth: device.width,
    dvce_screenheight: device.height,
    doc_charset: data.cs,
    doc_width: doc.width,
    doc_height: doc.height,
    tr_currency: null,
    tr_total_base: null,
    tr_tax_base: null,
    tr_shipping_base: null,
    ti_currency: null,
    ti_price_base: null,
    base_currency: null,
    geo_timezone: null,
    mkt_clickid: null,
    mkt_network: null,
    etl_tags: null,
    dvce_sent_tstamp: data.stm,
    refr_domain_userid: null,
    refr_dvce_tstamp: null,
    derived_contexts: null,
    domain_sessionid: data.sid,
    derived_tstamp: null,
    event_vendor: null,
    event_name: null,
    event_format: null,
    event_version: null,
    event_fingerprint: null,
    true_tstamp: null
  }

  const enriched = await Promise.reduce(enrichments, async (enrichment, enriched) => {
    return await enrichment(req, enriched)
  }, event)

  await raw.save({
    enriched
  },{
    transacting: req.analytics,
    patch: true
  })

  return

}

export default enrich
