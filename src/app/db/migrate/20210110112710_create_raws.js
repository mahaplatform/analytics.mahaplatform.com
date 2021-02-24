const CreateRaw = {

  databaseName: 'analytics',

  up: async (knex) => {
    await knex.schema.createTable('raws', (table) => {
      table.increments('id').primary()
      table.jsonb('data')
      table.jsonb('enriched')
      table.bool('is_valid')
      table.enum('validation_status', ['pending','processed','failed'], { useNative: true, enumName: 'raw_validation_statuses' })
      table.enum('enrichment_status', ['pending','processed','failed'], { useNative: true, enumName: 'raw_enrichment_statuses' })
      table.enum('modeling_status', ['pending','processed','failed'], { useNative: true, enumName: 'raw_modeling_statuses' })
      table.text('error')
      table.timestamps()
    })
  },

  down: async (knex) => {
    await knex.schema.dropTable('raws')
  }

}

export default CreateRaw
