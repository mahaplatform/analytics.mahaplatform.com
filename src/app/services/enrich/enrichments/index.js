import transactionEnrichment from './enrichments/transaction'
import useragentEnrichment from './enrichments/useragent'
import ipaddressEnrichment from './enrichments/ipaddress'
import campaginEnrichment from './enrichments/ipaddress'
import referrerEnrichment from './enrichments/referrer'
import pageEnrichment from './enrichments/page'

const enrichments = [
  pageEnrichment,
  referrerEnrichment,
  ipaddressEnrichment,
  campaginEnrichment,
  transactionEnrichment,
  useragentEnrichment
]

export default enrichments
