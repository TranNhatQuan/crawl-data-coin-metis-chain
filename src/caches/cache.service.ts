import { Redis } from 'ioredis'
import { Inject, Service } from 'typedi'
import { Config } from '../configs'

export const CacheTime = {
    day: (time = 1) => {
        return time * CacheTime.hour(24)
    },
    hour: (time = 1) => {
        return time * CacheTime.minute(60)
    },
    minute: (time = 1) => time * 60,
}

@Service()
export class CacheService {
    private redisClient: Redis

    constructor(@Inject() private config: Config) {
        this.redisClient = new Redis(this.config.redis)
    }

    async check() {
        await this.redisClient.ping()
    }

    async get(key: string): Promise<string> {
        return await this.redisClient.get(key)
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.redisClient.set(key, value)
        if (ttl) {
            await this.redisClient.expire(key, ttl)
        }
    }

    async del(key: string): Promise<number> {
        return await this.redisClient.del(key)
    }

    async exist(key: string) {
        return await this.redisClient.exists(key)
    }

    async delPattern(pattern: string): Promise<void> {
        const keys = await this.redisClient.keys(pattern)
        for (const key of keys) {
            await this.redisClient.del(key)
        }
    }
}
