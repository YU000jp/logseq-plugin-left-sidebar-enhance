/**
 * Performance optimization utilities
 */

/**
 * Cache for DOM elements to avoid repeated queries
 */
class DOMCache {
  private static instance: DOMCache
  private cache = new Map<string, HTMLElement | null>()
  private observers = new Map<string, MutationObserver>()

  private constructor() {}

  static getInstance(): DOMCache {
    if (!DOMCache.instance) {
      DOMCache.instance = new DOMCache()
    }
    return DOMCache.instance
  }

  /**
   * Get element with caching and automatic cache invalidation
   */
  get(selector: string): HTMLElement | null {
    if (this.cache.has(selector)) {
      const element = this.cache.get(selector)
      // Verify element is still in DOM
      if (element && element.isConnected) {
        return element
      } else {
        this.cache.delete(selector)
        this.clearObserver(selector)
      }
    }

    const element = parent.document.querySelector(selector) as HTMLElement | null
    if (element) {
      this.cache.set(selector, element)
      this.setupObserver(selector, element)
    }
    
    return element
  }

  /**
   * Get element by ID with caching
   */
  getElementById(id: string): HTMLElement | null {
    const selector = `#${id}`
    return this.get(selector)
  }

  /**
   * Clear cache for specific selector
   */
  invalidate(selector: string): void {
    this.cache.delete(selector)
    this.clearObserver(selector)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }

  /**
   * Setup mutation observer to invalidate cache when element is removed
   */
  private setupObserver(selector: string, element: HTMLElement): void {
    if (this.observers.has(selector)) return

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const removedNode of mutation.removedNodes) {
            if (removedNode === element || (removedNode as Element)?.contains?.(element)) {
              this.invalidate(selector)
              return
            }
          }
        }
      }
    })

    observer.observe(parent.document.body, {
      childList: true,
      subtree: true
    })

    this.observers.set(selector, observer)
  }

  private clearObserver(selector: string): void {
    const observer = this.observers.get(selector)
    if (observer) {
      observer.disconnect()
      this.observers.delete(selector)
    }
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    const callNow = immediate && !timeout
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func(...args)
    }, wait)
    
    if (callNow) func(...args)
  }) as T
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

/**
 * Request animation frame wrapper for smooth operations
 */
export function nextFrame(callback: () => void): void {
  requestAnimationFrame(callback)
}

/**
 * Batch DOM operations for better performance
 */
export function batchDOMOperations(operations: (() => void)[]): void {
  // Use document fragment to batch DOM changes
  requestAnimationFrame(() => {
    operations.forEach(operation => operation())
  })
}

/**
 * Smart timeout that can be cancelled and provides better performance
 */
export class SmartTimeout {
  private timeouts = new Map<string, NodeJS.Timeout>()

  set(key: string, callback: () => void, delay: number): void {
    this.clear(key) // Clear existing timeout
    const timeoutId = setTimeout(() => {
      callback()
      this.timeouts.delete(key)
    }, delay)
    this.timeouts.set(key, timeoutId)
  }

  clear(key: string): void {
    const timeoutId = this.timeouts.get(key)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(key)
    }
  }

  clearAll(): void {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId))
    this.timeouts.clear()
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, number[]>()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startMeasure(key: string): number {
    return performance.now()
  }

  endMeasure(key: string, startTime: number): number {
    const duration = performance.now() - startTime
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const measurements = this.metrics.get(key)!
    measurements.push(duration)
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift()
    }
    
    return duration
  }

  getStats(key: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(key)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)
    
    return { avg, min, max, count: measurements.length }
  }

  getAllStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [key] of this.metrics) {
      const stat = this.getStats(key)
      if (stat) {
        stats[key] = stat
      }
    }
    
    return stats
  }
}

// Export singleton instances
export const domCache = DOMCache.getInstance()
export const smartTimeout = new SmartTimeout()
export const performanceMonitor = PerformanceMonitor.getInstance()