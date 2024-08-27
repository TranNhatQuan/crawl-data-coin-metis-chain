import { Worker } from 'bullmq'
import { Redis } from 'ioredis'
import { config } from '../../configs'
import { QueueName } from '../queues'
import Container from 'typedi'
import { LeagueCrawlService } from '../../modules/crawl-data-sport/lad-brokes/league-crawl.service'

export const crawlListLeagueWorker = new Worker(
    QueueName.crawlListLeague,
    async () => {
        return Container.get(LeagueCrawlService).scanSportsAndCrawlLeague()
    },
    {
        connection: new Redis({
            ...config.redis,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
        }),
    }
)
