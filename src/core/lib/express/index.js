import 'express-async-errors'
import mtMiddleware from '@app/public/mt'
import transaction from './transaction'
import apiMiddleware from '@app/api'
import express from 'express'
import qs from 'qs'

const server = express()

server.set('query parser', str => qs.parse(str, { arrayLimit: 100, depth: 10 }))

server.use(transaction)

server.use('/api', apiMiddleware)

server.use('/mt', mtMiddleware)

server.use((req, res) => res.send('not found'))

export default server
