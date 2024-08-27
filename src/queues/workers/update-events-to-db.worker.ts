import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { EventCrawlService } from '../../modules/crawl-data-sport/lad-brokes/event-crawl.service'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'

export const updateEventToDBWorker = new Worker(
    QueueName.updateEventToDB,
    async (job: Job) => {
        const { leagueId, events, isLatest } = job.data
        try {
            await Container.get(
                EventCrawlService
            ).updateDataEventsFromPriceKineticToDB({
                events,
                leagueId,
                isLatest,
            })
        } catch (error) {
            logger.error(error + ' update events leagueId: ' + leagueId)
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
