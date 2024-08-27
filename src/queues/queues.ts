import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { DefaultJobOptions, Queue } from 'bullmq'
import { Redis } from 'ioredis'
import Container, { Inject, Service } from 'typedi'
import { Config } from '../configs'

export enum QueueName {
    checkQueueToStartCrawl = 'checkQueueToStartCrawl',
    crawlListLeague = 'crawlListLeague',
    crawlListEventByLeague = 'crawlListEventByLeague',
    crawlDetailEvent = 'crawlDetailEvent',
    updateLeagueToDB = 'updateLeagueToDB',
    updateEventToDB = 'updateEventToDB',
    updateMarketToDB = 'updateMarketToDB',
    updateSelectionToDB = 'updateSelectionToDB',
}

enum CRON_TIME {
    crawlListLeague = 5 * 1000, //5 s
    crawlListEvent = 5 * 1000, //5 s
    crawlDetailEvent = 5 * 1000, //5 s
}

@Service()
export class QueueManager {
    private readonly queues: Record<string, Queue> = {}

    constructor(@Inject() private config: Config) {}

    createQueue(
        queueName: QueueName,
        jobOptions: DefaultJobOptions = {
            removeOnComplete: 100,
            removeOnFail: 100,
        }
    ): Queue {
        const queue = new Queue(queueName, {
            connection: new Redis(this.config.redis),
            defaultJobOptions: jobOptions,
        })
        this.queues[queueName] = queue
        return queue
    }

    getQueue(queueName: QueueName): Queue {
        const queue = this.queues[queueName]
        if (!queue) {
            throw new Error(`Queue [${queueName}] does not exist`)
        }
        return queue
    }

    createBoard() {
        const queueAdapter = new ExpressAdapter()
        createBullBoard({
            queues: Object.values(this.queues).map(
                (queue) => new BullMQAdapter(queue)
            ),
            serverAdapter: queueAdapter,
            options: {
                uiConfig: {
                    boardTitle: '',
                    boardLogo: { path: '' },
                },
            },
        })
        queueAdapter.setBasePath('/admin/queues')

        return queueAdapter
    }
}

export const setupQueues = () => {
    Object.values(QueueName).forEach((queueName) =>
        Container.get(QueueManager).createQueue(queueName)
    )
}

export const setupCronJob = async () => {
    //await checkQueueToStartCrawl()
    return
}

export const checkQueueToStartCrawl = async () => {
    const queue = Container.get(QueueManager).getQueue(
        QueueName.checkQueueToStartCrawl
    )
    const oldRepeatableJobs = await queue.getRepeatableJobs()
    for (const job of oldRepeatableJobs) {
        await queue.removeRepeatableByKey(job.key)
    }
    queue.add(
        QueueName.checkQueueToStartCrawl,
        {},
        {
            repeat: {
                every: CRON_TIME.crawlListLeague,
            },
        }
    )
}
