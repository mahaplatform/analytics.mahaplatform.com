import '@core/services/environment'
import { ec2 } from '@core/services/aws'
import Shipit from 'shipit-cli'
import utils from 'shipit-utils'
import roles from './roles'
import moment from 'moment'
import path from 'path'
import _ from 'lodash'

const processor = async () => {

  const args = process.argv.slice(2)

  const task = args[0]

  const environment = 'production'

  const shipit = new Shipit({ environment })

  const instances = await ec2.describeInstances().promise()

  const servers = instances.Reservations.reduce((servers, reservation) => [
    ...servers,
    ...reservation.Instances
  ], []).filter(instance => {
    return instance.State.Name === 'running'
  }).filter(instance => {
    const cost = instance.Tags.find(Tag => {
      return Tag.Key === 'Cost'
    })
    return cost.Value === 'maha'
  }).map(instance => {
    const tags = instance.Tags.reduce((tags, tag) => ({
      ...tags,
      [tag.Key]: tag.Value
    }), {})
    return {
      id: instance.InstanceId,
      env: tags.Env || 'production',
      user: 'centos',
      host: tags.Name,
      port: 22,
      roles: (tags.Role || '').split(',')
    }
  }).filter(instance => {
    return instance.id === 'i-0740ee3dcb6641954'
    // return _.intersection(['analyticsserver'], instance.roles).length > 0
  }).sort((a,b) => {
    return a.host < b.host ? -1 : 1
  })

  servers.map(server => {
    console.log(`${server.host} [${server.roles}]`)
  })

  shipit.initConfig({
    default: {
      asUser: 'root',
      key: process.env.SSH_KEY,
      strict: 'no'
    },
    production: {
      deployTo: '/var/www/maha',
      servers
    }
  })

  roles(shipit)

  const timestamp = moment().format('YYYYMMDDHHmmss')

  const deployDir = shipit.config.deployTo

  const releasesDir = path.join(deployDir,'releases')

  const releaseDir = path.join(releasesDir,timestamp)

  const platformDir = path.join(releaseDir,'platform')

  const sharedDir = path.join(deployDir,'shared')

  const currentDir = path.join(deployDir,'current')

  utils.registerTask(shipit, 'deploy', [
    'deploy:env',
    'deploy:build',
    'deploy:zip',
    'deploy:mkdir',
    'deploy:upload',
    'deploy:unzip',
    'deploy:install',
    'deploy:link_shared',
    // 'deploy:migrate',
    'deploy:symlink',
    'deploy:reload_nginx',
    'deploy:restart_pm2',
    'deploy:cache',
    'deploy:clean'
  ])

  utils.registerTask(shipit, 'sync', [
    'sync:backup',
    'sync:download',
    'sync:restore',
    'sync:remove',
    'sync:teams',
    'sync:passwords',
    'sync:phone_numbers',
    'sync:braintree'
  ])

  utils.registerTask(shipit, 'cleanup', async () => {
    const revision = args[1]
    await shipit.remote(`rm -rf ${releasesDir}/${revision}`, {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'rollback', async () => {
    const revision = args[1]
    await shipit.remote(`rm -rf ${currentDir} && ln -s ${releasesDir}/${revision} ${currentDir}`, {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:env', async () => {
    await shipit.local(`NODE_ENV=production npm run env ${environment}`)
  })

  utils.registerTask(shipit, 'deploy:build', async () => {
    await shipit.local(`NODE_ENV=production npm run build ${environment} ${platformDir}`)
  })


  utils.registerTask(shipit, 'deploy:zip', async () => {
    await shipit.local('cd ./dist && tar -czf ../dist.tgz .')
  })

  utils.registerTask(shipit, 'deploy:mkdir', async () => {
    await shipit.remote(`mkdir -p ${releaseDir}`, {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:upload', async () => {
    await shipit.copyToRemote('dist.tgz', `${releaseDir}/dist.tgz`, {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:unzip', async () => {
    await shipit.remote('tar -xzf dist.tgz && rm -rf dist.tgz', {
      roles: ['analyticsserver'],
      cwd: releaseDir
    })
  })

  utils.registerTask(shipit, 'deploy:install', async () => {
    await shipit.remote('npm install --production --unsafe-perm=true --no-spin', {
      roles: ['analyticsserver'],
      cwd: path.join(releaseDir, 'platform')
    })
  })

  utils.registerTask(shipit, 'deploy:link_shared', async () => {
    const commands = [
      `ln -s ${sharedDir}/maxmind ${platformDir}/maxmind`,
      `ln -s ${sharedDir}/logs ${platformDir}/logs`,
      `ln -s ${sharedDir}/tmp ${platformDir}/tmp`,
      `ln -s ${sharedDir}/imagecache ${platformDir}/public/imagecache`
    ]
    await shipit.remote(commands.join(' && '), {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:migrate', async () => {
    await shipit.remote('NODE_ENV=production node ./core/scripts/db/index.js migrate:up', {
      roles: ['analyticsserver'],
      cwd: path.join(releaseDir, 'platform')
    })
  })

  utils.registerTask(shipit, 'deploy:symlink', async () => {
    await shipit.remote(`rm -rf ${currentDir} && ln -s ${releaseDir} ${currentDir}`, {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:reload_nginx', () => {
    return shipit.remote('service nginx reload', {
      roles: ['analyticsserver']
    })
  })

  utils.registerTask(shipit, 'deploy:restart_pm2', [
    'deploy:restart_analytics_cron',
    'deploy:restart_analytics_worker'
  ])

  utils.registerTask(shipit, 'deploy:restart_analytics_cron', () => {
    return shipit.remote('NODE_ENV=production pm2 startOrRestart ./current/platform/ecosystem.config.js --only analytics_cron_production', {
      cwd: deployDir,
      roles: ['cron']
    })
  })

  utils.registerTask(shipit, 'deploy:restart_analytics_worker', () => {
    return shipit.remote('NODE_ENV=production pm2 startOrRestart ./current/platform/ecosystem.config.js --only analytics_worker_production', {
      cwd: deployDir,
      roles: ['worker']
    })
  })

  utils.registerTask(shipit, 'deploy:cache', () => {
    return shipit.remote('wget -O - http://127.0.0.1/ping', {
      roles: 'appserver'
    })
  })

  utils.registerTask(shipit, 'deploy:clean', () => {
    return shipit.remote(`ls -rd ${releasesDir}/*|grep -v $(readlink ${currentDir})|xargs rm -rf`, {
      roles: 'appserver'
    })
  })

  shipit.initialize()

  shipit.on('err', () => process.exit(1))

  shipit.on('task_err', () => process.exit(1))

  shipit.on('task_not_found', () => process.exit(1))

  await shipit.start(task)

}

processor()
