import { REDIS_TTL } from '../../redis/redis.config';
import { RedisService } from '../../redis/redis.service';
import { isEmpty, isNotEmpty } from 'class-validator';

const redisService = new RedisService();

export const useCache = async <T>(
  cacheKey: string,
  getData: () => Promise<T>,
  ttl?: number,
) => {
  const cachedData = await redisService.get(cacheKey);
  const data = cachedData ? (JSON.parse(cachedData) as T) : await getData();
  if (
    isEmpty(cachedData) &&
    isNotEmpty(data) &&
    (Array.isArray(data) ? data.length > 0 : true)
  ) {
    await redisService.setex(cacheKey, ttl ?? REDIS_TTL, JSON.stringify(data));
  }
  return data;
};
