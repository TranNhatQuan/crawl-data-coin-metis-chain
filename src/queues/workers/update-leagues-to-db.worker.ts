import { Job, Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { logger } from '../../utils/logger'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'
import { LeagueCrawlService } from '../../modules/crawl-data-sport/lad-brokes/league-crawl.service'

export const updateLeagueToDBWorker = new Worker(
    QueueName.updateLeagueToDB,
    async (job: Job) => {
        const { sportId, leagues, isLatest } = job.data
        try {
            await Container.get(
                LeagueCrawlService
            ).updateDataLeaguesFromPriceKineticToDB({
                leagues,
                sportId,
                isLatest,
            })
        } catch (error) {
            logger.error(error + ' update leagues sportId: ' + sportId)
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
