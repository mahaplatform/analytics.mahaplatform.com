import EnrichQueue from '@app/queue/enrich_queue'
import Raw from '@app/models/raw'
import path from 'path'
import fs from 'fs'

const data = fs.readFileSync(path.join(__dirname, 'spacer.gif'))

const collectRoute = async (req, res) => {

  await Promise.mapSeries(req.body.data, async (data) => {

    const raw = await Raw.forge({
      headers: {
        useragent: req.headers['user-agent']
      },
      data,
      status: 'pending',
      attempts: 0
    }).fetch({
      transacting: req.analytics
    })

    await EnrichQueue.enqueue(req, {
      id: raw.get('id')
    })

  })

  return res.status(200).type('image/gif').send(data)

}

export default collectRoute
