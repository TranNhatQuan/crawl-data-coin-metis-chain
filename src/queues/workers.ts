import { Worker } from 'bullmq'
import Container, { Service } from 'typedi'

@Service()
export class WorkerManager {
    private workers: Record<string, Worker> = {}

    addWorker(worker: Worker) {
        this.workers[worker.name] = worker
        return worker
    }

    async close() {
        await Promise.all(
            Object.values(this.workers).map((worker) => worker.close())
        )
    }
}

export const setupWorkers = () => {
    const workers = []
    workers.forEach((worker) => Container.get(WorkerManager).addWorker(worker))
}
