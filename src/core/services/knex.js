import Knex from 'knex'

const knex = (connection) => new Knex({
  client: 'postgresql',
  connection,
  useNullAsDefault: true,
  pool: {
    min: 5,
    max: 10
  }
})

export const analytics = knex(process.env.ANALYTICS_URL)

export default analytics
