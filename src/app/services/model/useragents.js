import Manufacturer from '@app/models/manufacturer'
import Useragent from '@app/models/useragent'
import Browser from '@app/models/browser'
import Version from '@app/models/version'
import Device from '@app/models/device'
import OS from '@app/models/os'

export const getUseragent = async(req, { enriched }) => {

  const useragent = await Useragent.query(qb => {
    qb.where('useragent', enriched.useragent)
  }).fetch({
    transacting: req.analytics
  })

  if(useragent) return useragent

  const device = await Device.fetchOrCreate({
    text: enriched.dvce_type
  },{
    transacting: req.analytics
  })

  const manufacturer = enriched.dvce_manufacturer ? await Manufacturer.fetchOrCreate({
    text: enriched.dvce_manufacturer
  },{
    transacting: req.analytics
  }) : null

  const os = enriched.os_name ? await OS.fetchOrCreate({
    text: enriched.os_name
  },{
    transacting: req.analytics
  }): null

  const os_version = enriched.os_version ? await Version.fetchOrCreate({
    text: enriched.os_version
  },{
    transacting: req.analytics
  }) : null

  const browser = enriched.br_name ? await Browser.fetchOrCreate({
    text: enriched.br_name
  },{
    transacting: req.analytics
  }): null

  const browser_version = enriched.br_version ? await Version.fetchOrCreate({
    text: enriched.br_version
  },{
    transacting: req.analytics
  }) : null

  return await Useragent.forge({
    device_id: device.get('id'),
    manufacturer_id: manufacturer ? manufacturer.get('id') : null,
    os_id: os ? os.get('id') : null,
    os_version_id: os_version ? os_version.get('id') : null,
    browser_id: browser ? browser.get('id') : null,
    browser_version_id: browser_version ? browser_version.get('id') : null,
    useragent: enriched.useragent
  }).save(null, {
    transacting: req.analytics
  })

}
