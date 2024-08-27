import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'
import { DetailEventCrawlService } from '../../modules/crawl-data-sport/lad-brokes/detail-event-crawl.service'

export const crawlListMarketWorker = new Worker(
    QueueName.crawlDetailEvent,
    async (job: Job) => {
        const { eventId, isLatest } = job.data
        try {
            await Container.get(DetailEventCrawlService).crawlMarketByEvent({
                eventId,
                isLatest,
            })
        } catch (error) {
            logger.error(error + ' crawl detail event: ' + eventId)
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
        concurrency: config.concurrency,
    }
)
