import { Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueManager, QueueName } from '../queues'
import Container from 'typedi'
import { LadBrokeCacheService } from '../../modules/crawl-data-sport/lad-brokes/lad-broke-cache/lad-broke-cache.service'

export const checkQueueToStartCrawlWorker = new Worker(
    QueueName.checkQueueToStartCrawl,
    async () => {
        const queueManager = Container.get(QueueManager)
        const isRunning = await Container.get(LadBrokeCacheService).isRunning()
        if (!isRunning) {
            await Container.get(LadBrokeCacheService).setIsRunning()
            await queueManager
                .getQueue(QueueName.crawlListLeague)
                .add(QueueName.crawlListLeague, {})
        }
        return !isRunning
    },
    {
        connection: new Redis({
            ...config.redis,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        }),
    }
)
