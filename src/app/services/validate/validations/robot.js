import isbot from 'isbot'

const robotValidation = async(req, data) => {

  if(!data.ua) return event

  return !isbot(data.useragent)

}

export default robotValidation
