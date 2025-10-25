import { kv } from '@vercel/kv';
import Redis from 'ioredis';

const isDev = process.env.NODE_ENV === 'development';

class LocalKVStore {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.KV_URL || 'redis://localhost:6379');
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }
}

export const kvStore = isDev ? new LocalKVStore() : kv;

