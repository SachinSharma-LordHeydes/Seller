import { CacheService } from './redis';
import MemoryCacheService from './memory';

export interface CacheInterface {
  get<T>(key: string): Promise<T | null> | T | null;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> | void;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  getStats?(): any;
}

export class UnifiedCacheService implements CacheInterface {
  private redisCache?: CacheService;
  private memoryCache: MemoryCacheService;
  private useRedis: boolean;

  constructor() {
    this.memoryCache = MemoryCacheService.getInstance();
    this.useRedis = process.env.REDIS_URL !== undefined;
    
    if (this.useRedis) {
      try {
        this.redisCache = CacheService.getInstance();
      } catch (error) {
        console.warn('Redis cache initialization failed, falling back to memory cache:', error);
        this.useRedis = false;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis && this.redisCache) {
      try {
        return await this.redisCache.get<T>(key);
      } catch (error) {
        console.warn('Redis get failed, trying memory cache:', error);
        return this.memoryCache.get<T>(key);
      }
    }
    return this.memoryCache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    if (this.useRedis && this.redisCache) {
      try {
        await this.redisCache.set(key, value, ttlSeconds);
        return;
      } catch (error) {
        console.warn('Redis set failed, using memory cache:', error);
      }
    }
    this.memoryCache.set(key, value, ttlSeconds);
  }

  async delete(key: string): Promise<boolean> {
    if (this.useRedis && this.redisCache) {
      try {
        return await this.redisCache.delete(key);
      } catch (error) {
        console.warn('Redis delete failed, using memory cache:', error);
      }
    }
    return this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (this.useRedis && this.redisCache) {
      try {
        await this.redisCache.clear();
      } catch (error) {
        console.warn('Redis clear failed, clearing memory cache only:', error);
      }
    }
    this.memoryCache.clear();
  }

  getStats() {
    const memoryStats = this.memoryCache.getStats();
    
    if (this.useRedis) {
      return {
        type: 'redis-with-memory-fallback',
        redis: this.redisCache ? 'connected' : 'failed',
        memory: memoryStats
      };
    }
    
    return {
      type: 'memory-only',
      memory: memoryStats
    };
  }

  // Static cache key generators
  static productKey = (id: string) => `product:${id}`;
  static userProductsKey = (userId: string, page: number = 1) => `user:${userId}:products:page:${page}`;
  static categoriesKey = () => 'categories:all';
  static searchKey = (query: string, filters: any) => {
    const filterHash = Buffer.from(JSON.stringify(filters)).toString('base64');
    return `search:${query}:${filterHash}`;
  };
}

// Singleton instance
let cacheInstance: UnifiedCacheService;

export function getCache(): UnifiedCacheService {
  if (!cacheInstance) {
    cacheInstance = new UnifiedCacheService();
  }
  return cacheInstance;
}

// Generic cache decorator that works with both async and sync methods
export function withCache(
  keyGenerator: (...args: any[]) => string, 
  ttl: number = 3600
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getCache();
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache the result
      await cache.set(key, result, ttl);
      
      return result;
    };
  };
}

// Cache invalidation helper
export async function invalidateCache(pattern: string): Promise<void> {
  const cache = getCache();
  
  if (cache['redisCache'] && cache['useRedis']) {
    try {
      await cache['redisCache'].invalidateByPattern(pattern);
    } catch (error) {
      console.warn('Redis pattern invalidation failed:', error);
    }
  }
  
  // For memory cache, we can't do pattern matching easily,
  // so we clear the entire cache for simplicity
  if (pattern.includes('*')) {
    await cache.clear();
  }
}

export { CacheService, MemoryCacheService };
