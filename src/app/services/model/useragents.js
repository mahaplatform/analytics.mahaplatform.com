import Manufacturer from '@app/models/manufacturer'
import Useragent from '@app/models/useragent'
import Browser from '@app/models/browser'
import Version from '@app/models/version'
import Device from '@app/models/device'
import UAParser from 'ua-parser-js'
import OS from '@app/models/os'

export const getUseragent = async(req, { data }) => {

  const useragent = await Useragent.query(qb => {
    qb.where('useragent', data.useragent)
  }).fetch({
    transacting: req.analytics
  })

  if(useragent) return useragent

  const ua = UAParser(data.useragent)

  const device = await Device.fetchOrCreate({
    text: ua.device.type || 'computer'
  },{
    transacting: req.analytics
  })

  const manufacturer = ua.device.vendor ? await Manufacturer.fetchOrCreate({
    text: ua.device.vendor
  },{
    transacting: req.analytics
  }) : null

  const os = ua.os.name ? await OS.fetchOrCreate({
    text: ua.os.name
  },{
    transacting: req.analytics
  }): null

  const os_version = ua.os.version ? await Version.fetchOrCreate({
    text: ua.os.version
  },{
    transacting: req.analytics
  }) : null

  const browser = ua.browser.name ? await Browser.fetchOrCreate({
    text: ua.browser.name
  },{
    transacting: req.analytics
  }): null

  const browser_version = ua.browser.major ? await Version.fetchOrCreate({
    text: ua.browser.major
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
    useragent: data.useragent
  }).save(null, {
    transacting: req.analytics
  })

}
