import { spawn } from 'child_process'
import '@core/services/environment'
import log from '@core/utils/log'
import path from 'path'

const serverWatch = async () => {

  const nodemon = [
    path.resolve('src','scripts','entities.js'),
    '--inspect',
    '--color',
    '--quiet',
    '--exec',
    'babel-node',
    '--config-file=./babel.config.js'
  ]
  nodemon.push('--watch')
  nodemon.push(path.resolve('src','app'))
  nodemon.push('--watch')
  nodemon.push(path.resolve('src','core'))

  const proc = spawn('nodemon', nodemon, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  proc.on('message', function (event) {
    if(event.type === 'start') {
      log('info', 'dev', 'Compiling servers')
    } else if (event.type === 'restart') {
      log('info', 'dev', `Detected change in ${event.data[0]}`)
    }
  })

  proc.stdout.on('data', function (data) {
    process.stdout.write(data)
  })

  proc.stderr.on('data', function (err) {
    log('error', 'dev', err.toString())
  })

}

export const dev = async () => {
  await serverWatch()
}

dev()
