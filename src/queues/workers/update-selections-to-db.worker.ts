import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { DetailEventCrawlService } from '../../modules/crawl-data-sport/lad-brokes/detail-event-crawl.service'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'

export const updateSelectionToDBWorker = new Worker(
    QueueName.updateSelectionToDB,
    async (job: Job) => {
        const { marketId, selections, isLatest } = job.data
        try {
            await Container.get(DetailEventCrawlService).updateSelections({
                marketId,
                isLatest,
                selections,
            })
        } catch (error) {
            logger.error(error + ' update detail market: ' + marketId)
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
