import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'
import { DetailEventCrawlService } from '../../modules/crawl-data-sport/lad-brokes/detail-event-crawl.service'

export const updateMarketToDBWorker = new Worker(
    QueueName.updateMarketToDB,
    async (job: Job) => {
        const { markets, eventId, marketTrending, isLatest } = job.data
        try {
            await Container.get(
                DetailEventCrawlService
            ).updateDataMarketsFromPriceKineticToDB({
                eventId,
                markets,
                marketTrending,
                isLatest,
            })
        } catch (error) {
            logger.error(error + ' update detail event: ' + eventId)
            if (isLatest) {
                await Container.get(LadBrokeCacheService).delIsRunning()
            }
        }
    },
    {
        connection: new Redis({
            ...config.redis,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        }),
    }
)
