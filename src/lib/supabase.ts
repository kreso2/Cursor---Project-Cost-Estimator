import { createClient } from '@supabase/supabase-js'
import { exchangeRateService, historicalRateTracker } from './exchangeRates'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qcphqciezuptvzezabam.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGhxY2llenVwdHZ6ZXphYmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDEzMDIsImV4cCI6MjA2ODQxNzMwMn0.H4UwITwCcx2wX1TPkWZWTLp7hawexOwS6gFbawTsgMA'

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'global_admin' | 'role_admin' | 'user'
          avatar_url?: string
          created_at: string
          updated_at: string
          last_login?: string
          is_active: boolean
          preferences?: Record<string, any>
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: 'global_admin' | 'role_admin' | 'user'
          avatar_url?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          is_active?: boolean
          preferences?: Record<string, any>
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'global_admin' | 'role_admin' | 'user'
          avatar_url?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          is_active?: boolean
          preferences?: Record<string, any>
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description?: string
          user_id: string
          data: Record<string, any>
          currency: string
          exchange_rate?: number
          total_cost: number
          is_template: boolean
          created_at: string
          updated_at: string
          status: 'draft' | 'active' | 'completed' | 'archived'
          tags?: string[]
          metadata?: Record<string, any>
        }
        Insert: {
          id?: string
          name: string
          description?: string
          user_id: string
          data: Record<string, any>
          currency: string
          exchange_rate?: number
          total_cost?: number
          is_template?: boolean
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'active' | 'completed' | 'archived'
          tags?: string[]
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          data?: Record<string, any>
          currency?: string
          exchange_rate?: number
          total_cost?: number
          is_template?: boolean
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'active' | 'completed' | 'archived'
          tags?: string[]
          metadata?: Record<string, any>
        }
      }
      project_shares: {
        Row: {
          id: string
          project_id: string
          shared_by: string
          shared_with: string
          permission: 'view' | 'edit'
          created_at: string
          expires_at?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          shared_by: string
          shared_with: string
          permission?: 'view' | 'edit'
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          shared_by?: string
          shared_with?: string
          permission?: 'view' | 'edit'
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
      }
      project_templates: {
        Row: {
          id: string
          name: string
          description?: string
          user_id: string
          data: Record<string, any>
          category?: string
          is_public: boolean
          created_at: string
          updated_at: string
          usage_count: number
          rating?: number
          tags?: string[]
        }
        Insert: {
          id?: string
          name: string
          description?: string
          user_id: string
          data: Record<string, any>
          category?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          usage_count?: number
          rating?: number
          tags?: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          data?: Record<string, any>
          category?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          usage_count?: number
          rating?: number
          tags?: string[]
        }
      }
      role_catalog: {
        Row: {
          id: string
          name: string
          description?: string
          base_rate: number
          currency: string
          location_variations: Record<string, number>
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
          category?: string
          skills?: string[]
          experience_level?: 'junior' | 'mid' | 'senior' | 'expert'
        }
        Insert: {
          id?: string
          name: string
          description?: string
          base_rate: number
          currency: string
          location_variations?: Record<string, number>
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          category?: string
          skills?: string[]
          experience_level?: 'junior' | 'mid' | 'senior' | 'expert'
        }
        Update: {
          id?: string
          name?: string
          description?: string
          base_rate?: number
          currency?: string
          location_variations?: Record<string, number>
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          category?: string
          skills?: string[]
          experience_level?: 'junior' | 'mid' | 'senior' | 'expert'
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'project_shared' | 'project_updated' | 'system' | 'reminder'
          is_read: boolean
          created_at: string
          related_id?: string
          action_url?: string
          priority: 'low' | 'medium' | 'high'
          expires_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'project_shared' | 'project_updated' | 'system' | 'reminder'
          is_read?: boolean
          created_at?: string
          related_id?: string
          action_url?: string
          priority?: 'low' | 'medium' | 'high'
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'project_shared' | 'project_updated' | 'system' | 'reminder'
          is_read?: boolean
          created_at?: string
          related_id?: string
          action_url?: string
          priority?: 'low' | 'medium' | 'high'
          expires_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values?: Record<string, any>
          new_values?: Record<string, any>
          ip_address?: string
          user_agent?: string
          created_at: string
          metadata?: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values?: Record<string, any>
          new_values?: Record<string, any>
          ip_address?: string
          user_agent?: string
          created_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          old_values?: Record<string, any>
          new_values?: Record<string, any>
          ip_address?: string
          user_agent?: string
          created_at?: string
          metadata?: Record<string, any>
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Type exports for components
export type User = Database['public']['Tables']['users']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectShare = Database['public']['Tables']['project_shares']['Row']
export type ProjectTemplate = Database['public']['Tables']['project_templates']['Row']
export type RoleCatalog = Database['public']['Tables']['role_catalog']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Project calculator specific types
export interface ProjectRole {
  id: string
  name: string
  role_id?: string
  location: string
  hourly_rate: number
  bill_rate: number
  cost_rate: number
  monthly_allocation: number
  hours: number
  cost: number
  currency: string
  monthly_breakdown: MonthlyAllocation[]
}

export interface ProjectSettings {
  duration_months: number
  monthly_hours: number
  target_currency: string
  exchange_rate_base: string
}

export interface ProjectCalculations {
  total_cost: number
  total_billing: number
  gross_margin: number
  gross_margin_percentage: number
  blended_rate: number
  monthly_breakdown: MonthlyBreakdown[]
}

export interface MonthlyAllocation {
  month: number
  allocation: number
  hours: number
  cost: number
}

export interface MonthlyBreakdown {
  month: number
  total_cost: number
  total_billing: number
  margin: number
  margin_percentage: number
}

export interface ProjectData {
  id?: string
  name: string
  description?: string
  roles: ProjectRole[]
  project_settings: ProjectSettings
  calculations: ProjectCalculations
  exchange_rates: Record<string, number>
  created_at?: string
  updated_at?: string
}

// Enhanced Supabase service class
export class SupabaseService {
  private client = supabase

  // Authentication methods
  async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.client.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  // User management
  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser()
    if (error) throw error
    return user
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await this.client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Project management with exchange rate integration
  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    // Get exchange rate if different from USD
    let exchangeRate = 1
    
    // Skip exchange rate fetching if disabled via environment variable
    const skipExchangeRates = import.meta.env.VITE_SKIP_EXCHANGE_RATES === 'true'
    
    if (projectData.currency !== 'USD' && !skipExchangeRates) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Exchange rate fetch timeout')), 5000)
        )
        
        const ratePromise = exchangeRateService.getExchangeRate('USD', projectData.currency)
        const rate = await Promise.race([ratePromise, timeoutPromise]) as any
        exchangeRate = rate.rate
        historicalRateTracker.saveRate(rate)
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using 1:1:', error)
        exchangeRate = 1 // Fallback to 1:1 rate
      }
    } else if (skipExchangeRates) {
      console.log('🔄 Exchange rate fetching disabled via environment variable')
    }

    console.log('💾 Creating project with exchange rate:', exchangeRate)

    const { data, error } = await this.client
      .from('projects')
      .insert({
        ...projectData,
        exchange_rate: exchangeRate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error creating project:', error)
      throw error
    }
    
    console.log('✅ Project created successfully:', data.id)
    return data
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    const { data, error } = await this.client
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getProjects(userId: string, options?: {
    status?: Project['status']
    isTemplate?: boolean
    limit?: number
    offset?: number
  }) {
    let query = this.client
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.isTemplate !== undefined) {
      query = query.eq('is_template', options.isTemplate)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Real-time subscriptions
  subscribeToProjects(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // Notification management
  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>) {
    const { data, error } = await this.client
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await this.client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getUnreadNotificationsCount(userId: string) {
    const { count, error } = await this.client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    return count || 0
  }

  // Audit logging
  async logAuditEvent(auditData: Omit<AuditLog, 'id' | 'created_at'>) {
    const { data, error } = await this.client
      .from('audit_logs')
      .insert({
        ...auditData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Role-based access control
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.getUserProfile(userId)
    
    // Global admins have all permissions
    if (user.role === 'global_admin') return true
    
    // Role admins can manage users and roles
    if (user.role === 'role_admin' && ['users', 'roles'].includes(resource)) return true
    
    // Users can only access their own resources
    return action === 'read' || action === 'write'
  }

  // Data validation helpers
  validateProjectData(data: any): boolean {
    const requiredFields = ['name', 'user_id', 'currency']
    return requiredFields.every(field => data[field] !== undefined && data[field] !== null)
  }

  validateUserData(data: any): boolean {
    const requiredFields = ['email', 'first_name', 'last_name']
    return requiredFields.every(field => data[field] !== undefined && data[field] !== null)
  }

  // Error handling
  handleError(error: any): string {
    if (error.code === 'PGRST116') {
      return 'Access denied. You do not have permission to perform this action.'
    }
    if (error.code === '23505') {
      return 'A record with this information already exists.'
    }
    if (error.code === '23503') {
      return 'This operation would violate data integrity constraints.'
    }
    return error.message || 'An unexpected error occurred.'
  }
}

// Create service instance
export const supabaseService = new SupabaseService() 