// Performance monitoring utility functions

export const logPerformance = (operation: string, startTime: number, additionalInfo?: any) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[Performance] ${operation}: ${duration.toFixed(2)}ms`, additionalInfo || '');
  
  // Log slow operations (over 1 second)
  if (duration > 1000) {
    console.warn(`[Performance Warning] Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
  }
};

export const measureAsync = async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    logPerformance(operation, startTime);
    return result;
  } catch (error) {
    logPerformance(`${operation} (failed)`, startTime, error);
    throw error;
  }
};
