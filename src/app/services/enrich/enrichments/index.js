import transactionEnrichment from './transaction'
import useragentEnrichment from './useragent'
import ipaddressEnrichment from './ipaddress'
import campaginEnrichment from './ipaddress'
import referrerEnrichment from './referrer'
import pageEnrichment from './page'

const enrichments = [
  pageEnrichment,
  referrerEnrichment,
  ipaddressEnrichment,
  campaginEnrichment,
  transactionEnrichment,
  useragentEnrichment
]

export default enrichments
