import React from 'react'

// Performance optimization utilities
export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CacheOptions {
  ttl: number // Time to live in milliseconds
  key: string
  version?: string
}

// Query optimization utilities
export class QueryOptimizer {
  private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  // Optimize database queries with pagination
  static createPaginationQuery(baseQuery: any, options: PaginationOptions) {
    const { page, limit } = options
    const offset = options.offset ?? (page - 1) * limit

    return baseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
  }

  // Cache query results
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const cacheKey = `${key}_${options.version || 'v1'}`
    const cached = this.queryCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    const data = await queryFn()
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl
    })

    return data
  }

  // Clear expired cache entries
  static clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.queryCache.delete(key)
      }
    }
  }

  // Batch multiple queries
  static async batchQueries<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(queries.map(query => query()))
  }

  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// Pagination utilities
export class PaginationHelper {
  static createPaginatedResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const { page, limit } = options
    const totalPages = Math.ceil(total / limit)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  static getPageInfo(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit + 1
    const end = Math.min(page * limit, total)

    return {
      start,
      end,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  static generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5) {
    const pages: number[] = []
    const halfVisible = Math.floor(maxVisible / 2)

    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }
}

// Memory management utilities
export class MemoryManager {
  private static memoryUsage = new Map<string, number>()
  private static readonly MAX_MEMORY_USAGE = 50 * 1024 * 1024 // 50MB

  static trackMemoryUsage(key: string, size: number): void {
    this.memoryUsage.set(key, size)
    this.checkMemoryLimit()
  }

  static getMemoryUsage(): { total: number; entries: Array<{ key: string; size: number }> } {
    const entries = Array.from(this.memoryUsage.entries()).map(([key, size]) => ({
      key,
      size
    }))
    
    const total = entries.reduce((sum, entry) => sum + entry.size, 0)
    
    return { total, entries }
  }

  private static checkMemoryLimit(): void {
    const { total } = this.getMemoryUsage()
    
    if (total > this.MAX_MEMORY_USAGE) {
      // Clear oldest entries
      const entries = Array.from(this.memoryUsage.entries())
        .sort(([, a], [, b]) => a - b)
      
      let clearedSize = 0
      for (const [key, size] of entries) {
        this.memoryUsage.delete(key)
        clearedSize += size
        
        if (total - clearedSize <= this.MAX_MEMORY_USAGE * 0.8) {
          break
        }
      }
      
      console.warn(`Memory limit exceeded, cleared ${clearedSize} bytes`)
    }
  }

  static clearMemory(): void {
    this.memoryUsage.clear()
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  // Lazy load components
  static lazyLoad<T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) {
    return React.lazy(importFn)
  }

  // Preload critical resources
  static preloadResource(url: string, type: 'script' | 'style' | 'image'): void {
    const link = document.createElement('link')
    link.rel = type === 'script' ? 'preload' : 'prefetch'
    link.as = type
    link.href = url
    document.head.appendChild(link)
  }

  // Optimize images
  static optimizeImage(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  }): string {
    // This would integrate with an image optimization service
    // For now, return the original URL
    return url
  }

  // Code splitting utilities
  static createRouteChunk(route: string) {
    return () => import(`../pages/${route}.tsx`)
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(name: string): () => void {
    const start = performance.now()
    return () => this.endTimer(name, start)
  }

  static endTimer(name: string, start: number): void {
    const duration = performance.now() - start
    const metrics = this.metrics.get(name) || []
    metrics.push(duration)
    this.metrics.set(name, metrics)

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      this.metrics.set(name, metrics.slice(-100))
    }
  }

  static getMetrics(name?: string): Record<string, { avg: number; min: number; max: number; count: number }> {
    if (name) {
      const metrics = this.metrics.get(name) || []
      return {
        [name]: {
          avg: metrics.reduce((sum, m) => sum + m, 0) / metrics.length,
          min: Math.min(...metrics),
          max: Math.max(...metrics),
          count: metrics.length
        }
      }
    }

    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    for (const [key, metrics] of this.metrics.entries()) {
      result[key] = {
        avg: metrics.reduce((sum, m) => sum + m, 0) / metrics.length,
        min: Math.min(...metrics),
        max: Math.max(...metrics),
        count: metrics.length
      }
    }
    return result
  }

  static clearMetrics(): void {
    this.metrics.clear()
  }
}

// React performance utilities
export const usePerformanceOptimization = () => {
  const memoize = React.useCallback
  const memo = React.useMemo

  const debouncedCallback = React.useCallback(
    <T extends (...args: any[]) => any>(callback: T, delay: number) => {
      return QueryOptimizer.debounce(callback, delay)
    },
    []
  )

  const throttledCallback = React.useCallback(
    <T extends (...args: any[]) => any>(callback: T, limit: number) => {
      return QueryOptimizer.throttle(callback, limit)
    },
    []
  )

  return {
    memoize,
    memo,
    debouncedCallback,
    throttledCallback
  }
} 