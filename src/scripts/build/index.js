import '../../core/services/environment'
import { transform } from '@babel/core'
import log from '../../core/utils/log'
import move from 'move-concurrently'
import env from '../env/env'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import path from 'path'
import _ from 'lodash'
import ncp from 'ncp'
import ejs from 'ejs'
import fs from 'fs'

const srcDir = path.resolve('src')

const jswhitelist = ['mt.js']

const dist = path.resolve('dist')

const staged = `${dist}.staged`

const copy = Promise.promisify(ncp)

const getBabelRc = (root) => {
  const file = path.resolve('babel.config.js')
  const babelrc = require(file)
  babelrc.plugins = babelrc.plugins.map(plugin => {
    if(typeof(plugin) === 'string') return plugin
    if(plugin[0] !== 'module-resolver') return plugin
    return [
      'module-resolver',
      {
        alias: Object.keys(plugin[1].alias).reduce((aliases, key) => ({
          ...aliases,
          [key]: plugin[1].alias[key].replace('./src', root)
        }), {})
      }
    ]
  })
  return {
    ...babelrc,
    sourceMaps: 'inline'
  }
}

const getItemType = (item) => {
  return path.extname(item).length > 0 ? path.extname(item).substr(1) : 'dir'
}

const getItem = (src, root, item) => ({
  src,
  type: getItemType(item)
})

const listContents = (src, root, item) => [
  getItem(src, root, item),
  ...fs.lstatSync(src).isDirectory() ? listItems(src) : []
]

const listItems = (root) => fs.readdirSync(root).reduce((items, item) => [
  ...items,
  ...listContents(path.join(root, item), root, item)
], []).filter(item => {
  if(item.src.match(/\.git/)) return false
  if(item.src.match(/\.DS_Store/)) return false
  if(item.src.match(/_test.js$/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/badges/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/components/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/roots/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/routes/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/tokens/)) return false
  if(item.src.match(/apps\/[^/]*\/admin\/views/)) return false
  return true
})

const transpileFile = (babelrc, src, dest) => {
  const source = fs.readFileSync(src, 'utf8')
  const transpiled = transform(source, babelrc)
  fs.writeFileSync(dest, transpiled.code)
}

const buildItem = async (babelrc, item, srcPath, destPath) => {
  const dest = item.src.replace(srcPath, destPath)
  const file = path.basename(item.src)
  if(!_.includes(jswhitelist, file) && item.type === 'js') return transpileFile(babelrc, item.src, dest)
  if(item.type === 'dir') return mkdirp.sync(dest)
  return await copy(item.src, dest)
}

const buildEntry = (babelrc) => async (entry) => {
  const srcPath = path.resolve('src',entry)
  const destPath = path.join(staged,entry)
  await transpileFile(babelrc, srcPath, destPath)
}

const buildDir = (babelrc) => async (dir) => {
  const srcPath = path.resolve('src',dir)
  const destPath = path.join(staged,dir)
  mkdirp.sync(destPath)
  const items = listItems(srcPath)
  await Promise.mapSeries(items, item => buildItem(babelrc, item, srcPath, destPath))
}

const buildServer = async (environment, babelrc) => {
  log('info', 'server', 'Compiling...')
  const coreDirs = ['lib','objects','services','utils'].map(dir => `core/${dir}`)
  const entries = fs.readdirSync(srcDir).filter(item => {
    return !fs.lstatSync(path.join(srcDir,item)).isDirectory()
  })
  await Promise.map(coreDirs, buildDir(babelrc))
  await Promise.map(entries, buildEntry(babelrc))
  const template = fs.readFileSync(path.join(__dirname, 'ecosystem.config.js.ejs'), 'utf8')
  const data = ejs.render(template, { environment })
  fs.writeFileSync(path.join(staged,'ecosystem.config.js'), data, 'utf8')
  await copy(path.join('package.json'), path.join(staged,'package.json'))
  await copy(path.join('package-lock.json'), path.join(staged,'package-lock.json'))
  log('info', 'server', 'Compiled successfully.')
}

const buildEnv = async(environment) => {
  log('info', 'environment', 'Compiling...')
  await env(path.join(staged), environment)
  log('info', 'environment', 'Compiled successfully.')
}

const getDuration = (start) => {
  const diff = process.hrtime(start)
  const ms = diff[0] * 1e3 + diff[1] * 1e-6
  const duration =  (ms / 1000).toFixed(3)
  return `${duration}s`
}

const build = async () => {
  const args = process.argv.slice(2)
  const environment = args[0] || 'production'
  const root = args[1] || path.join(dist)
  const babelrc = getBabelRc(root)
  const start = process.hrtime()
  rimraf.sync(staged)
  await Promise.all([
    buildServer(environment, babelrc),
    buildEnv(environment)
  ])
  rimraf.sync(dist)
  await move(staged, dist)
  log('info', 'build', `Finished in ${getDuration(start)}`)
}

build().then(process.exit)
