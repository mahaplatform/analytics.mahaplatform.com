import Knex from 'knex'

export default new Knex({
  client: 'postgresql',
  connection: process.env.ANALYTICS_URL,
  useNullAsDefault: true,
  pool: {
    min: 5,
    max: 10
  }
})
