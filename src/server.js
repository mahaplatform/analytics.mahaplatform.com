import '@core/services/environment'
import app from '@core/lib/express'
import { Server } from 'http'

const transport = Server(app)

transport.listen(process.env.SERVER_PORT)
