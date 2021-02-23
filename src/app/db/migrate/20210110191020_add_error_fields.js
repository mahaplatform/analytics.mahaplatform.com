const AddErrorFields = {

  databaseName: 'analytics',

  up: async (knex) => {

    await knex.schema.table('events', (table) => {
      table.decimal('value', 8, 2).alter()
    })

  },

  down: async (knex) => {
  }

}

export default AddErrorFields
