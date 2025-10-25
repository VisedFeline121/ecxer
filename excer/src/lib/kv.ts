import Redis from 'ioredis';

class RedisStore {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }
}

export const kvStore = new RedisStore();

