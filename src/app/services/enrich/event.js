const events = {
  pv: 'page_view',
  pp: 'page_ping',
  tr: 'transaction',
  ti: 'transaction_item',
  se: 'struct',
  ue: 'unstruct'
}

const parsedim = (dim) => {
  const parts = dim ? dim.split('x') : [null,null]
  return {
    width: parts[0],
    height: parts[1]
  }
}

const parseEvent = (req, { data }) => {

  const doc = parsedim(data.ds)

  const device = parsedim(data.res)

  const viewport = parsedim(data.vp)

  return {
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
    user_ipaddress: data.ip,
    user_fingerprint: data.fp,
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
    contexts: null,
    se_category: data.se_ca,
    se_action: data.se_ac,
    se_label: data.se_la,
    se_property: data.se_pr,
    se_value: data.se_va,
    unstruct_event: null,
    pp_xoffset_min: null,
    pp_xoffset_max: null,
    pp_yoffset_min: null,
    pp_yoffset_max: null,
    useragent: data.ua,
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
    os_timezone: data.tz,
    dvce_screenwidth: device.width,
    dvce_screenheight: device.height,
    doc_charset: data.cs,
    doc_width: doc.width,
    doc_height: doc.height,
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

}

export default parseEvent
