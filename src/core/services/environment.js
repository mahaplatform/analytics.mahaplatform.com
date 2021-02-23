import dotenv from 'dotenv'
import events from 'events'
import path from 'path'
import fs from 'fs'

events.EventEmitter.defaultMaxListeners = 0
if(envPath) dotenv.load({
  path: path.resolve(__dirname,'..','..','.env')
})
