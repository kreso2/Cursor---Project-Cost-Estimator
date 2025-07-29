// Security utilities and configurations
export interface SecurityConfig {
  maxRequestsPerMinute: number
  allowedOrigins: string[]
  sessionTimeout: number
  passwordMinLength: number
  requireSpecialChars: boolean
  maxLoginAttempts: number
  lockoutDuration: number
}

export interface RateLimitInfo {
  remaining: number
  resetTime: number
  limit: number
}

export interface SecurityHeaders {
  'Content-Security-Policy': string
  'X-Frame-Options': string
  'X-Content-Type-Options': string
  'X-XSS-Protection': string
  'Referrer-Policy': string
  'Strict-Transport-Security': string
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  maxRequestsPerMinute: 100,
  allowedOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://yourdomain.com'],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 8,
  requireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000 // 15 minutes
}

// Rate limiting implementation
export class RateLimiter {
  private static requestCounts = new Map<string, { count: number; resetTime: number }>()
  private static config = defaultSecurityConfig

  static setConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static checkRateLimit(identifier: string): RateLimitInfo {
    const now = Date.now()
    const key = `rate_limit_${identifier}`
    const current = this.requestCounts.get(key)

    if (!current || now > current.resetTime) {
      // Reset or create new rate limit entry
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + 60 * 1000 // 1 minute window
      })

      return {
        remaining: this.config.maxRequestsPerMinute - 1,
        resetTime: now + 60 * 1000,
        limit: this.config.maxRequestsPerMinute
      }
    }

    if (current.count >= this.config.maxRequestsPerMinute) {
      return {
        remaining: 0,
        resetTime: current.resetTime,
        limit: this.config.maxRequestsPerMinute
      }
    }

    // Increment count
    current.count++
    this.requestCounts.set(key, current)

    return {
      remaining: this.config.maxRequestsPerMinute - current.count,
      resetTime: current.resetTime,
      limit: this.config.maxRequestsPerMinute
    }
  }

  static isRateLimited(identifier: string): boolean {
    const info = this.checkRateLimit(identifier)
    return info.remaining <= 0
  }

  static clearRateLimit(identifier: string): void {
    const key = `rate_limit_${identifier}`
    this.requestCounts.delete(key)
  }

  static cleanupExpiredEntries(): void {
    const now = Date.now()
    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime) {
        this.requestCounts.delete(key)
      }
    }
  }
}

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
  }

  // Sanitize SQL injection attempts
  static sanitizeSql(input: string): string {
    return input
      .replace(/['";]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '')
      .replace(/exec\s*\(/gi, '')
      .replace(/execute\s*\(/gi, '')
      .replace(/union\s+select/gi, '')
      .replace(/drop\s+table/gi, '')
      .replace(/delete\s+from/gi, '')
      .replace(/insert\s+into/gi, '')
      .replace(/update\s+set/gi, '')
  }

  // Sanitize file paths
  static sanitizePath(input: string): string {
    return input
      .replace(/\.\./g, '')
      .replace(/\/\//g, '/')
      .replace(/\\/g, '/')
      .replace(/[<>:"|?*]/g, '')
  }

  // Sanitize email addresses
  static sanitizeEmail(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, '')
  }

  // Sanitize phone numbers
  static sanitizePhone(input: string): string {
    return input
      .replace(/[^\d+\-\(\)\s]/g, '')
      .trim()
  }

  // Sanitize URLs
  static sanitizeUrl(input: string): string {
    try {
      const url = new URL(input)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return ''
      }
      return url.toString()
    } catch {
      return ''
    }
  }

  // General text sanitization
  static sanitizeText(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }

  // Sanitize JSON data
  static sanitizeJson(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeText(data)
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {}
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.sanitizeText(key, 100)
        sanitized[sanitizedKey] = this.sanitizeJson(value)
      }
      return sanitized
    }
    return data
  }
}

// Password security utilities
export class PasswordSecurity {
  static validatePassword(password: string, config: SecurityConfig = defaultSecurityConfig): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < config.passwordMinLength) {
      errors.push(`Password must be at least ${config.passwordMinLength} characters long`)
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  static hashPassword(password: string): Promise<string> {
    // In a real implementation, use a proper hashing library like bcrypt
    // For now, return a simple hash (NOT for production use)
    return Promise.resolve(btoa(password + '_salt'))
  }

  static verifyPassword(password: string, hash: string): Promise<boolean> {
    // In a real implementation, use proper password verification
    return Promise.resolve(btoa(password + '_salt') === hash)
  }
}

// Authentication token utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry'

  static setToken(token: string, expiry?: number): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    if (expiry) {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString())
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static isTokenValid(): boolean {
    const token = this.getToken()
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    
    if (!token || !expiry) {
      return false
    }

    return Date.now() < parseInt(expiry)
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

// CORS configuration
export class CORSConfig {
  private static config = defaultSecurityConfig

  static setConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static isOriginAllowed(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin)
  }

  static getCORSHeaders(origin: string): Record<string, string> {
    if (!this.isOriginAllowed(origin)) {
      return {}
    }

    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  }
}

// Security headers configuration
export const securityHeaders: SecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

// Login attempt tracking
export class LoginAttemptTracker {
  private static attempts = new Map<string, { count: number; lockoutUntil: number }>()
  private static config = defaultSecurityConfig

  static setConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config }
  }

  static recordAttempt(identifier: string): boolean {
    const now = Date.now()
    const current = this.attempts.get(identifier)

    if (!current || now > current.lockoutUntil) {
      // Reset or create new attempt entry
      this.attempts.set(identifier, {
        count: 1,
        lockoutUntil: 0
      })
      return true
    }

    if (current.count >= this.config.maxLoginAttempts) {
      return false // Still locked out
    }

    // Increment attempt count
    current.count++
    this.attempts.set(identifier, current)

    if (current.count >= this.config.maxLoginAttempts) {
      // Lock out the account
      current.lockoutUntil = now + this.config.lockoutDuration
      this.attempts.set(identifier, current)
    }

    return true
  }

  static isLockedOut(identifier: string): boolean {
    const current = this.attempts.get(identifier)
    if (!current) return false

    return current.count >= this.config.maxLoginAttempts && Date.now() < current.lockoutUntil
  }

  static getRemainingAttempts(identifier: string): number {
    const current = this.attempts.get(identifier)
    if (!current) return this.config.maxLoginAttempts

    return Math.max(0, this.config.maxLoginAttempts - current.count)
  }

  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  static getLockoutTimeRemaining(identifier: string): number {
    const current = this.attempts.get(identifier)
    if (!current || current.lockoutUntil === 0) return 0

    return Math.max(0, current.lockoutUntil - Date.now())
  }
}

// Security middleware for API calls
export class SecurityMiddleware {
  static async validateRequest(request: Request): Promise<{ isValid: boolean; error?: string }> {
    const origin = request.headers.get('origin')
    
    if (origin && !CORSConfig.isOriginAllowed(origin)) {
      return { isValid: false, error: 'Invalid origin' }
    }

    const identifier = this.getRequestIdentifier(request)
    if (RateLimiter.isRateLimited(identifier)) {
      return { isValid: false, error: 'Rate limit exceeded' }
    }

    return { isValid: true }
  }

  private static getRequestIdentifier(request: Request): string {
    // In a real implementation, this would use IP address or user ID
    return request.headers.get('x-forwarded-for') || 'unknown'
  }

  static sanitizeRequestBody(body: any): any {
    return InputSanitizer.sanitizeJson(body)
  }

  static addSecurityHeaders(response: Response): Response {
    const headers = new Headers(response.headers)
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
} 