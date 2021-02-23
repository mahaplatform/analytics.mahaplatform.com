import { gzip } from '@core/services/gzip'
import { s3 } from '@core/services/aws'
import Raw from '@app/models/raw'
import moment from 'moment'

export const archiveRaws = async (req) => {

  const events = await Raw.query(qb => {
    qb.whereRaw('created_at < ?', moment().startOf('day'))
    qb.where('status', 'processed')
  }).fetchAll({
    transacting: req.analytics
  })

  if(events.length === 0) return

  const records = events.reduce((records, event) => {
    const timestamp = moment(event.get('created_at')).format('YYYYMMDD')
    return {
      ...records,
      [timestamp]: [
        ...records[timestamp] || [],
        event.get('data')
      ]
    }
  }, {})

  await Promise.mapSeries(Object.keys(records), async (timestamp) => {

    await s3.upload({
      ACL: 'private',
      Body: await gzip(records[timestamp].join('\n')),
      Bucket: process.env.AWS_BUCKET,
      ContentType: 'application/gzip',
      Key: `analytics/${timestamp}.tsv.gz`
    }).promise()

    await upload(req, {
      acl: 'private',
      bucket: process.env.AWS_DATA_BUCKET,
      key: `analytics/${timestamp}.tsv.gz`,
      file_data: await gzip(records[timestamp].join('\n'))
    })
  })

  await req.analytics('raws').where(qb => {
    qb.whereRaw('created_at < ?', moment().startOf('day'))
    qb.where('status', 'processed')
  }).del()

}
