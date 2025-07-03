// Cache helper functions for GraphQL resolvers

// Simple in-memory cache for development
const cache = new Map<string, { value: any; expiry: number }>();

export const invalidateCache = async (keys: string[] = []) => {
  if (keys.length === 0) {
    // Clear all cache
    cache.clear();
    console.log('[Cache] All cache cleared');
  } else {
    // Clear specific keys
    keys.forEach(key => {
      cache.delete(key);
      console.log(`[Cache] Cleared cache for key: ${key}`);
    });
  }
};

export const setCache = (key: string, value: any, ttl: number = 300) => {
  const expiry = Date.now() + (ttl * 1000);
  cache.set(key, { value, expiry });
  console.log(`[Cache] Set cache for key: ${key}, TTL: ${ttl}s`);
};

export const getCache = (key: string) => {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }
  
  if (Date.now() > cached.expiry) {
    cache.delete(key);
    console.log(`[Cache] Expired cache for key: ${key}`);
    return null;
  }
  
  console.log(`[Cache] Hit for key: ${key}`);
  return cached.value;
};

export const getCacheStats = () => {
  const now = Date.now();
  const total = cache.size;
  const expired = Array.from(cache.values()).filter(item => now > item.expiry).length;
  
  return {
    total,
    active: total - expired,
    expired
  };
};
