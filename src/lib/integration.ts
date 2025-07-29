// Comprehensive integration example demonstrating all new features
import { supabaseService } from './supabase'
import { exchangeRateService, historicalRateTracker } from './exchangeRates'
import { ValidationService, projectSchema } from './validation'
import { QueryOptimizer, PaginationHelper, PerformanceMonitor } from './performance'
import { 
  RateLimiter, 
  InputSanitizer, 
  PasswordSecurity, 
  TokenManager,
  SecurityMiddleware 
} from './security'
import { toast } from 'react-hot-toast'

// Integration service that combines all features
export class IntegrationService {
  private static instance: IntegrationService
  private performanceTimer: (() => void) | null = null

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService()
    }
    return IntegrationService.instance
  }

  // Enhanced project creation with all integrations
  async createProjectWithIntegrations(projectData: any, userId: string) {
    this.performanceTimer = PerformanceMonitor.startTimer('createProject')

    try {
      // 1. Security validation
      const securityValidation = await SecurityMiddleware.validateRequest(
        new Request('http://localhost:3000/api/projects', { method: 'POST' })
      )
      
      if (!securityValidation.isValid) {
        throw new Error(`Security validation failed: ${securityValidation.error}`)
      }

      // 2. Input sanitization
      const sanitizedData = InputSanitizer.sanitizeJson(projectData)

      // 3. Data validation
      const validation = ValidationService.validateForm(projectSchema, sanitizedData)
      if (!validation.success) {
        throw new Error(`Validation failed: ${Object.values(validation.errors || {}).join(', ')}`)
      }

      // 4. Exchange rate integration
      const currency = sanitizedData.currency || 'USD'
      let exchangeRate = 1
      
      if (currency !== 'USD') {
        try {
          const rate = await exchangeRateService.getExchangeRate('USD', currency)
          exchangeRate = rate.rate
          historicalRateTracker.saveRate(rate)
          
          // Update project data with exchange rate
          sanitizedData.exchange_rate = exchangeRate
          
          // Convert costs to USD for storage
          if (sanitizedData.data?.teamMembers) {
            sanitizedData.data.teamMembers = sanitizedData.data.teamMembers.map((member: any) => ({
              ...member,
              billingRateUSD: member.currency !== 'USD' 
                ? exchangeRateService.convertAmount(member.billingRate, member.currency, 'USD', exchangeRate)
                : member.billingRate
            }))
          }
        } catch (error) {
          console.warn('Failed to fetch exchange rate, using 1:1:', error)
          toast.warning('Exchange rate unavailable, using 1:1 conversion')
        }
      }

      // 5. Performance optimization with caching
      const cacheKey = `project_${userId}_${Date.now()}`
      const cachedProject = await QueryOptimizer.cachedQuery(
        cacheKey,
        () => supabaseService.createProject({
          ...sanitizedData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
        { ttl: 5 * 60 * 1000, key: cacheKey } // 5 minutes cache
      )

      // 6. Audit logging
      await supabaseService.logAuditEvent({
        user_id: userId,
        action: 'CREATE',
        table_name: 'projects',
        record_id: cachedProject.id,
        new_values: sanitizedData,
        ip_address: '127.0.0.1', // In real app, get from request
        user_agent: 'ProjectCostCalculator/1.0'
      })

      // 7. Real-time notification
      await supabaseService.createNotification({
        user_id: userId,
        title: 'Project Created',
        message: `Project "${sanitizedData.name}" has been created successfully`,
        type: 'project_updated',
        related_id: cachedProject.id,
        priority: 'medium'
      })

      toast.success('Project created successfully with real-time exchange rates!')
      return cachedProject

    } catch (error) {
      console.error('Project creation failed:', error)
      toast.error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      if (this.performanceTimer) {
        this.performanceTimer()
      }
    }
  }

  // Enhanced project fetching with pagination and performance optimization
  async getProjectsWithOptimizations(userId: string, options: {
    page?: number
    limit?: number
    status?: string
    search?: string
  } = {}) {
    const { page = 1, limit = 10, status, search } = options

    try {
      // 1. Rate limiting check
      if (RateLimiter.isRateLimited(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // 2. Performance monitoring
      this.performanceTimer = PerformanceMonitor.startTimer('getProjects')

      // 3. Cached query with pagination
      const cacheKey = `projects_${userId}_${page}_${limit}_${status}_${search}`
      const result = await QueryOptimizer.cachedQuery(
        cacheKey,
        async () => {
          let query = supabaseService.client
            .from('projects')
            .select('*')
            .eq('user_id', userId)

          if (status) {
            query = query.eq('status', status)
          }

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
          }

          // Apply pagination
          const paginationOptions = { page, limit }
          const paginatedQuery = QueryOptimizer.createPaginationQuery(query, paginationOptions)
          
          const { data, error } = await paginatedQuery
          if (error) throw error

          // Get total count for pagination
          const { count } = await supabaseService.client
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

          return {
            data: data || [],
            total: count || 0
          }
        },
        { ttl: 2 * 60 * 1000, key: cacheKey } // 2 minutes cache
      )

      // 4. Create paginated result
      const paginatedResult = PaginationHelper.createPaginatedResult(
        result.data,
        result.total,
        { page, limit }
      )

      // 5. Update exchange rates for display
      const projectsWithRates = await Promise.all(
        paginatedResult.data.map(async (project) => {
          if (project.currency !== 'USD' && project.exchange_rate) {
            // Get current exchange rate for display
            try {
              const currentRate = await exchangeRateService.getExchangeRate('USD', project.currency)
              return {
                ...project,
                current_exchange_rate: currentRate.rate,
                rate_updated_at: currentRate.timestamp
              }
            } catch (error) {
              console.warn('Failed to get current exchange rate for project:', project.id)
              return project
            }
          }
          return project
        })
      )

      return {
        ...paginatedResult,
        data: projectsWithRates
      }

    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      if (this.performanceTimer) {
        this.performanceTimer()
      }
    }
  }

  // Enhanced user authentication with security features
  async authenticateUserWithSecurity(email: string, password: string) {
    try {
      // 1. Input sanitization
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email)
      const sanitizedPassword = InputSanitizer.sanitizeText(password, 100)

      // 2. Rate limiting for login attempts
      const identifier = `login_${sanitizedEmail}`
      if (RateLimiter.isRateLimited(identifier)) {
        throw new Error('Too many login attempts. Please try again later.')
      }

      // 3. Password validation
      const passwordValidation = PasswordSecurity.validatePassword(sanitizedPassword)
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
      }

      // 4. Authentication
      const authData = await supabaseService.signIn(sanitizedEmail, sanitizedPassword)
      
      if (authData.user) {
        // 5. Token management
        TokenManager.setToken(authData.session?.access_token || '', 
          authData.session?.expires_at ? authData.session.expires_at * 1000 : undefined)
        
        if (authData.session?.refresh_token) {
          TokenManager.setRefreshToken(authData.session.refresh_token)
        }

        // 6. Update last login
        await supabaseService.updateUserProfile(authData.user.id, {
          last_login: new Date().toISOString()
        })

        // 7. Clear login attempts on success
        RateLimiter.clearRateLimit(identifier)

        toast.success('Authentication successful!')
        return authData
      }

      throw new Error('Authentication failed')

    } catch (error) {
      console.error('Authentication failed:', error)
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  // Real-time data subscription with error handling
  setupRealTimeSubscriptions(userId: string) {
    try {
      // 1. Projects subscription
      const projectsSubscription = supabaseService.subscribeToProjects(userId, (payload) => {
        console.log('Project update received:', payload)
        
        // Handle different event types
        switch (payload.eventType) {
          case 'INSERT':
            toast.success('New project created!')
            break
          case 'UPDATE':
            toast.success('Project updated!')
            break
          case 'DELETE':
            toast.success('Project deleted!')
            break
        }
      })

      // 2. Notifications subscription
      const notificationsSubscription = supabaseService.subscribeToNotifications(userId, (payload) => {
        console.log('Notification received:', payload)
        
        if (payload.eventType === 'INSERT') {
          const notification = payload.new
          toast(notification.message, {
            duration: 5000,
            icon: '🔔'
          })
        }
      })

      return {
        projects: projectsSubscription,
        notifications: notificationsSubscription
      }

    } catch (error) {
      console.error('Failed to setup real-time subscriptions:', error)
      toast.error('Real-time updates unavailable')
    }
  }

  // Performance monitoring and cleanup
  getPerformanceMetrics() {
    return PerformanceMonitor.getMetrics()
  }

  cleanupResources() {
    // Clear expired cache entries
    QueryOptimizer.clearExpiredCache()
    
    // Clear expired rate limit entries
    RateLimiter.cleanupExpiredEntries()
    
    // Clear performance metrics
    PerformanceMonitor.clearMetrics()
    
    console.log('Resources cleaned up successfully')
  }
}

// Export singleton instance
export const integrationService = IntegrationService.getInstance()

// Usage examples
export const integrationExamples = {
  // Example: Create a project with all integrations
  async createProjectExample() {
    const projectData = {
      name: 'Sample Project',
      description: 'A sample project with integrations',
      currency: 'EUR',
      data: {
        projectSettings: {
          name: 'Sample Project',
          currency: 'EUR'
        },
        teamMembers: [
          {
            name: 'John Doe',
            role: 'Developer',
            location: 'Germany',
            monthlyAllocation: 80,
            billingRate: 75,
            currency: 'EUR'
          }
        ],
        calculations: {
          totalCost: 6000,
          grossMargin: 25,
          blendedRate: 75
        }
      }
    }

    try {
      const result = await integrationService.createProjectWithIntegrations(
        projectData, 
        'user-id-here'
      )
      console.log('Project created:', result)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  },

  // Example: Fetch projects with optimizations
  async fetchProjectsExample() {
    try {
      const result = await integrationService.getProjectsWithOptimizations(
        'user-id-here',
        { page: 1, limit: 10, status: 'active' }
      )
      console.log('Projects fetched:', result)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  },

  // Example: Authenticate user with security
  async authenticateUserExample() {
    try {
      const result = await integrationService.authenticateUserWithSecurity(
        'user@example.com',
        'SecurePassword123!'
      )
      console.log('User authenticated:', result)
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }
} 