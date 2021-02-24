import '@core/services/environment'
import { updateDatabase } from '@app/services/maxmind'

const processor = async () => {
  await updateDatabase()
}

processor()
