import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { REDIS_RECONNECT_INTERVAL, redis } from './redis.config';
import { RedisKey } from 'ioredis';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis = redis;
  private logger = new Logger(RedisService.name);

  async onModuleInit() {
    await this.connect();
    setInterval(() => {
      if (this.redis.status !== 'ready') this.connect();
    }, REDIS_RECONNECT_INTERVAL * 1000);
  }

  async connect() {
    this.redis
      .connect()
      .then(() => this.logger.log('Redis connected'))
      .catch((error) => {
        console.error(error);
        this.logger.error(error);
      });
  }

  async setex(
    key: RedisKey,
    seconds: string | number,
    value: string | number | Buffer,
  ) {
    try {
      return await redis.setex(key, seconds, value);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async get(key: RedisKey) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async keys(pattern: string) {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async del(args: RedisKey[]) {
    try {
      if (!args) return null;
      args = args.filter((arg) => isNotEmpty(arg));
      if (args.length == 0) return null;
      return await redis.del(...args);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
