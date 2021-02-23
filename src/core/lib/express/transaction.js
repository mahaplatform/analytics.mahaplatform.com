import onFinished from 'on-finished'
import knex from '@core/services/knex'

const withTransaction = (req, res, next) => {

  knex.transaction(analytics => {

    req.analytics = analytics

    onFinished(res, function (err, res) {
      if (err || (res.statusCode && res.statusCode >= 400)) {
        analytics.rollback()
      } else {
        analytics.commit()
      }
    })

    next()

  }).catch(err => {})

}

export default withTransaction
