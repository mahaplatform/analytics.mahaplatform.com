import fetchOrCreate from './fetch_or_create'
import knex from '@core/servies/vendor/knex'
import Bookshelf from 'bookshelf'

const bookshelf = Bookshelf(knex)

bookshelf.plugin('virtuals')

bookshelf.plugin(fetchOrCreate)

export default bookshelf
