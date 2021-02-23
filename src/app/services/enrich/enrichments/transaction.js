import atob from 'atob'

const transactionEnrichment = async(req, event) => {

  if(!event.cx) return event

  const context = JSON.parse(atob(event.cx))

  return {
    ...event,
    tr_orderid: null,
    tr_affiliation: null,
    tr_total: null,
    tr_tax: null,
    tr_shipping: null,
    tr_city: null,
    tr_state: null,
    tr_country: null,
    tr_currency: null,
    tr_total_base: null,
    tr_tax_base: null,
    tr_shipping_base: null,
    ti_orderid: null,
    ti_sku: null,
    ti_name: null,
    ti_category: null,
    ti_price: null,
    ti_quantity: null,
    ti_currency: null,
    ti_price_base: null
  }

}

export default transactionEnrichment
