import transactionEnrichment from './transaction'
import timestampsEnrichment from './timestamps'
import useragentEnrichment from './useragent'
import ipaddressEnrichment from './ipaddress'
import campaginEnrichment from './ipaddress'
import referrerEnrichment from './referrer'
import contextEnrichment from './context'
import pageEnrichment from './page'

const enrichments = [
  pageEnrichment,
  referrerEnrichment,
  ipaddressEnrichment,
  campaginEnrichment,
  transactionEnrichment,
  useragentEnrichment,
  contextEnrichment,
  timestampsEnrichment
]

export default enrichments
