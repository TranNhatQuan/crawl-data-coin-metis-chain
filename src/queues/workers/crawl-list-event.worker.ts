import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'
import { EventCrawlService } from '../../modules/crawl-data-sport/lad-brokes/event-crawl.service'

export const crawlListEventWorker = new Worker(
    QueueName.crawlListEventByLeague,
    async (job: Job) => {
        const { leagueId, isLatest } = job.data
        try {
            await Container.get(EventCrawlService).crawlListEventByLeague({
                leagueId,
                isLatest,
            })
        } catch (error) {
            logger.error(error + ' crawl list event league: ' + leagueId)
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
