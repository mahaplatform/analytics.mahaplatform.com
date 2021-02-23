import bookshelf from '@core/lib/bookshelf'
import _ from 'lodash'

class Model {

  constructor(options) {

    const model = bookshelf.Model.extend({

      hasTimestamps: options.hasTimestamps !== false,

      tableName: '',

      rules: {},

      virtuals: {},

      fetch: function(fetchOptions = {}) {
        return bookshelf.Model.prototype.fetch.call(this, mergeOptions(fetchOptions, options))
      },

      fetchAll: function(fetchOptions = {}) {
        return bookshelf.Model.prototype.fetchAll.call(this, mergeOptions(fetchOptions, options))
      },

      ...options

    })

    return model

  }

}

const mergeOptions = (options, config) => ({
  ...options,
  withRelated: [
    ...coerceArray(options.withRelated),
    ...coerceArray(config.withRelated)
  ]
})


const coerceArray = (value) => !_.isNil(value) ? (!_.isArray(value) ? [value] : value) : []

export default Model
