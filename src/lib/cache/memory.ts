class LRUNode<T> {
  key: string;
  value: T;
  prev: LRUNode<T> | null = null;
  next: LRUNode<T> | null = null;
  expiry: number;

  constructor(key: string, value: T, ttl: number) {
    this.key = key;
    this.value = value;
    this.expiry = Date.now() + ttl * 1000;
  }

  isExpired(): boolean {
    return Date.now() > this.expiry;
  }
}

export class MemoryCacheService {
  private static instance: MemoryCacheService;
  private capacity: number;
  private cache: Map<string, LRUNode<any>>;
  private head: LRUNode<any>;
  private tail: LRUNode<any>;

  private constructor(capacity: number = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    
    // Create dummy head and tail
    this.head = new LRUNode('head', null, 0);
    this.tail = new LRUNode('tail', null, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  static getInstance(capacity?: number): MemoryCacheService {
    if (!MemoryCacheService.instance) {
      MemoryCacheService.instance = new MemoryCacheService(capacity);
    }
    return MemoryCacheService.instance;
  }

  private removeNode(node: LRUNode<any>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
  }

  private addToHead(node: LRUNode<any>): void {
    node.prev = this.head;
    node.next = this.head.next;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  private moveToHead(node: LRUNode<any>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): LRUNode<any> | null {
    const lastNode = this.tail.prev;
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode);
      return lastNode;
    }
    return null;
  }

  get<T>(key: string): T | null {
    const node = this.cache.get(key);
    
    if (!node) {
      return null;
    }

    // Check if expired
    if (node.isExpired()) {
      this.removeNode(node);
      this.cache.delete(key);
      return null;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const existingNode = this.cache.get(key);
    
    if (existingNode) {
      // Update existing node
      existingNode.value = value;
      existingNode.expiry = Date.now() + ttlSeconds * 1000;
      this.moveToHead(existingNode);
    } else {
      // Create new node
      const newNode = new LRUNode(key, value, ttlSeconds);
      
      if (this.cache.size >= this.capacity) {
        // Remove least recently used
        const tail = this.removeTail();
        if (tail) {
          this.cache.delete(tail.key);
        }
      }
      
      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
  }

  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (node) {
      this.removeNode(node);
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Clean up expired entries
  cleanup(): void {
    const expiredKeys: string[] = [];
    
    for (const [key, node] of this.cache.entries()) {
      if (node.isExpired()) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      const node = this.cache.get(key);
      if (node) {
        this.removeNode(node);
        this.cache.delete(key);
      }
    });
  }

  getStats() {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      usage: (this.cache.size / this.capacity * 100).toFixed(2) + '%'
    };
  }

  // Cache key generators (same as Redis cache)
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

// Memory cache decorator
export function withMemoryCache(keyGenerator: (...args: any[]) => string, ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = MemoryCacheService.getInstance();
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache the result
      cache.set(key, result, ttl);
      
      return result;
    };
  };
}

// Periodically clean up expired entries
setInterval(() => {
  MemoryCacheService.getInstance().cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes

export default MemoryCacheService;
