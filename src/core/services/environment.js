import dotenv from 'dotenv'
import events from 'events'
import path from 'path'

events.EventEmitter.defaultMaxListeners = 0

dotenv.load({
  path: path.resolve(__dirname,'..','..','.env')
})
