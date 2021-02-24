import '@core/services/environment'
import knex from '@core/services/knex'
import log from '@core/utils/log'
import path from 'path'
import fs from 'fs'

const migrationPath = path.join(__dirname,'..','app','db','migrate')

const processor = async() => {

  const migrations = fs.readdirSync(migrationPath)

  await knex.transaction(async analytics => {

    await analytics.schema.createTableIfNotExists('schema_migrations', (table) => {
      table.string('migration')
    })

    await Promise.mapSeries(migrations, async (migration) => {

      const count = await analytics('schema_migrations').where({
        migration
      }).count('* as count').then(result => result[0].count)

      if(count > 0) return

      log('info', 'knex', migration)

      const { up } = require(path.join(migrationPath, migration)).default

      await up(analytics)

      await analytics('schema_migrations').insert({ migration })

    })

  }).catch(err => {})

}

processor().then(process.exit)
