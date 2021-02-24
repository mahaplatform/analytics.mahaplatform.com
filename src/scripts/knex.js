import '@core/services/environment'
import knex from '@core/services/knex'
import path from 'path'
import fs from 'fs'

const migrationPath = path.join(__dirname,'..','app','db','migrate')

const processor = async() => {

  const migrations = fs.readdirSync(migrationPath)

  await knex.transaction(async analytics => {

    await Promise.mapSeries(migrations, async (filename) => {

      const migration = require(path.join(migrationPath, filename)).default

      await migration.up(analytics)

    })

  }).catch(err => {})

}

processor().then(process.exit)
