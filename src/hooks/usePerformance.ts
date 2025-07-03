import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  totalTime: number;
  reRenderCount: number;
}

interface TimingEntry {
  name: string;
  startTime: number;
  duration: number;
  timestamp: number;
}

/**
 * Hook to monitor React component performance
 */
export function usePerformanceMonitor(componentName: string = 'Component') {
  const mountTimeRef = useRef<number>();
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Track mount time
  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    return () => {
      if (mountTimeRef.current) {
        const totalTime = performance.now() - mountTimeRef.current;
        
        // Log performance metrics on unmount
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${componentName}:`, {
            mountTime: mountTimeRef.current,
            totalTime,
            renderCount: renderCountRef.current,
            avgRenderTime: renderCountRef.current > 0 ? totalTime / renderCountRef.current : 0,
          });
        }
      }
    };
  }, [componentName]);

  // Track render time
  useEffect(() => {
    const renderStart = performance.now();
    renderCountRef.current += 1;
    
    // Measure render time
    const renderTime = performance.now() - renderStart;
    lastRenderTimeRef.current = renderTime;
    
    // Update metrics
    const currentTime = performance.now();
    const totalTime = mountTimeRef.current ? currentTime - mountTimeRef.current : 0;
    
    setMetrics({
      renderTime,
      mountTime: mountTimeRef.current || 0,
      totalTime,
      reRenderCount: renderCountRef.current,
    });
  });

  return metrics;
}

/**
 * Hook for custom performance timing
 */
export function usePerformanceTiming() {
  const timingsRef = useRef<Map<string, number>>(new Map());
  const entriesRef = useRef<TimingEntry[]>([]);

  const startTiming = useCallback((name: string) => {
    timingsRef.current.set(name, performance.now());
  }, []);

  const endTiming = useCallback((name: string) => {
    const startTime = timingsRef.current.get(name);
    if (startTime !== undefined) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const entry: TimingEntry = {
        name,
        startTime,
        duration,
        timestamp: Date.now(),
      };
      
      entriesRef.current.push(entry);
      timingsRef.current.delete(name);
      
      return entry;
    }
    return null;
  }, []);

  const getTimings = useCallback(() => {
    return [...entriesRef.current];
  }, []);

  const clearTimings = useCallback(() => {
    timingsRef.current.clear();
    entriesRef.current = [];
  }, []);

  const measure = useCallback(async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    startTiming(name);
    try {
      const result = await fn();
      endTiming(name);
      return result;
    } catch (error) {
      endTiming(name);
      throw error;
    }
  }, [startTiming, endTiming]);

  return {
    startTiming,
    endTiming,
    getTimings,
    clearTimings,
    measure,
  };
}

/**
 * Hook to monitor page load performance
 */
export function usePagePerformance() {
  const [metrics, setMetrics] = useState<{
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-paint') {
              setMetrics(prev => ({ ...prev!, firstPaint: entry.startTime }));
            } else if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev!, firstContentfulPaint: entry.startTime }));
            }
            break;
            
          case 'largest-contentful-paint':
            setMetrics(prev => ({ 
              ...prev!, 
              largestContentfulPaint: (entry as any).startTime 
            }));
            break;
            
          case 'first-input':
            setMetrics(prev => ({ 
              ...prev!, 
              firstInputDelay: (entry as any).processingStart - entry.startTime 
            }));
            break;
            
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ 
                ...prev!, 
                cumulativeLayoutShift: (prev?.cumulativeLayoutShift || 0) + (entry as any).value 
              }));
            }
            break;
        }
      });
    });

    // Observe performance entries
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Get navigation timing
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics(prev => ({
        ...prev!,
        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
      }));
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return metrics;
}

/**
 * Hook to track data fetching performance
 */
export function useFetchPerformance() {
  const [fetchMetrics, setFetchMetrics] = useState<{
    url: string;
    duration: number;
    status: number;
    timestamp: number;
  }[]>([]);

  const trackFetch = useCallback(async <T>(
    url: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    const timestamp = Date.now();
    
    try {
      const result = await fetchFn();
      const duration = performance.now() - startTime;
      
      setFetchMetrics(prev => [...prev, {
        url,
        duration,
        status: 200, // Assume success
        timestamp,
      }]);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      setFetchMetrics(prev => [...prev, {
        url,
        duration,
        status: 500, // Assume error
        timestamp,
      }]);
      
      throw error;
    }
  }, []);

  const clearMetrics = useCallback(() => {
    setFetchMetrics([]);
  }, []);

  const getAverageTime = useCallback((url?: string) => {
    const relevantMetrics = url 
      ? fetchMetrics.filter(m => m.url === url)
      : fetchMetrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / relevantMetrics.length;
  }, [fetchMetrics]);

  return {
    metrics: fetchMetrics,
    trackFetch,
    clearMetrics,
    getAverageTime,
  };
}

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  /**
   * Mark a performance timing point
   */
  mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure performance between two marks
   */
  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entry = performance.getEntriesByName(name, 'measure')[0];
        return entry?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Log performance metrics to console (development only)
   */
  logMetrics(componentName: string, metrics: Record<string, number>) {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚀 Performance Metrics: ${componentName}`);
      Object.entries(metrics).forEach(([key, value]) => {
        console.log(`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}ms`);
      });
      console.groupEnd();
    }
  },

  /**
   * Send performance metrics to analytics (placeholder)
   */
  sendToAnalytics(eventName: string, metrics: Record<string, number>) {
    // This would integrate with your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        custom_map: metrics,
      });
    }
    
    // Could also send to other analytics services like Mixpanel, Amplitude, etc.
  },
};
