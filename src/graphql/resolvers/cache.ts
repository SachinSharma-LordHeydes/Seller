// Simple cache wrapper for GraphQL resolvers
const cache = new Map<string, { value: any; expiry: number }>();

interface CacheOptions {
  key?: string;
  keyGenerator?: (...args: any[]) => string;
  ttl?: number; // in seconds
}

export const cacheFunction = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: CacheOptions = {}
) => {
  const { key, keyGenerator, ttl = 300 } = options;
  
  return async (...args: T): Promise<R> => {
    const cacheKey = key || (keyGenerator ? keyGenerator(...args) : `default:${JSON.stringify(args)}`);
    
    // Check if cached value exists and is not expired
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      console.log(`[Cache] Hit for key: ${cacheKey}`);
      return cached.value;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    const expiry = Date.now() + (ttl * 1000);
    cache.set(cacheKey, { value: result, expiry });
    console.log(`[Cache] Set for key: ${cacheKey}, TTL: ${ttl}s`);
    
    return result;
  };
};

// Export as 'cache' for compatibility
export { cacheFunction as cache };
