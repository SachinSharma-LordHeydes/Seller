import { createClient } from 'redis';

export class CacheService {
  private static instance: CacheService;
  private client: ReturnType<typeof createClient> | null = null;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async connect() {
    if (!this.client) {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });
      
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) await this.connect();
    
    try {
      const value = await this.client?.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.client) await this.connect();
    
    try {
      await this.client?.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) await this.connect();
    
    try {
      await this.client?.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client) await this.connect();
    
    try {
      const keys = await this.client?.keys(pattern);
      if (keys && keys.length > 0) {
        await this.client?.del(keys);
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
    }
  }

  // Cache key generators
  static productKey(id: string) {
    return `product:${id}`;
  }

  static userProductsKey(userId: string, page: number = 1) {
    return `user:${userId}:products:page:${page}`;
  }

  static categoriesKey() {
    return 'categories:all';
  }

  static searchKey(query: string, filters: any) {
    const filterHash = Buffer.from(JSON.stringify(filters)).toString('base64');
    return `search:${query}:${filterHash}`;
  }
}

// Cache decorators for GraphQL resolvers
export function withCache(keyGenerator: (...args: any[]) => string, ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheService.getInstance();
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = await cache.get(key);
      if (cached) {
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

export default CacheService;
