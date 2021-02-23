import '@core/services/environment'
import app from '@core/lib/express'
import log from '@core/utils/log'
import { Server } from 'http'

const transport = Server(app)

transport.listen(process.env.SERVER_PORT, () => {
  log('info', 'server', `Listening on ${process.env.SERVER_PORT}`)
})
