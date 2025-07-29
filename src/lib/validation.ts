import { z } from 'zod'
import { exchangeRateService } from './exchangeRates'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

// User validation schemas
export const userSchema = z.object({
  email: emailSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  role: z.enum(['global_admin', 'role_admin', 'user']).default('user'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  preferences: z.record(z.any()).optional()
})

export const userUpdateSchema = userSchema.partial()

// Project validation schemas
export const projectDataSchema = z.object({
  projectSettings: z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    currency: z.string().min(3, 'Currency code is required').max(3, 'Currency code must be 3 characters'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    exchangeRate: z.number().positive('Exchange rate must be positive').optional()
  }),
  teamMembers: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    location: z.string().optional(),
    monthlyAllocation: z.number().min(0, 'Allocation must be non-negative').max(100, 'Allocation cannot exceed 100%'),
    billingRate: z.number().positive('Billing rate must be positive'),
    currency: z.string().min(3).max(3),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })).min(1, 'At least one team member is required'),
  calculations: z.object({
    totalCost: z.number().min(0, 'Total cost must be non-negative'),
    grossMargin: z.number().min(-100, 'Gross margin must be at least -100%').max(100, 'Gross margin cannot exceed 100%'),
    blendedRate: z.number().positive('Blended rate must be positive'),
    monthlyBreakdown: z.array(z.object({
      month: z.string(),
      cost: z.number().min(0),
      revenue: z.number().min(0),
      margin: z.number()
    })).optional()
  })
})

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  user_id: z.string().uuid('Invalid user ID'),
  data: projectDataSchema,
  currency: z.string().min(3).max(3),
  exchange_rate: z.number().positive().optional(),
  total_cost: z.number().min(0),
  is_template: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
})

// Role catalog validation schemas
export const roleCatalogSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  base_rate: z.number().positive('Base rate must be positive'),
  currency: z.string().min(3).max(3),
  location_variations: z.record(z.number().positive('Location variation must be positive')),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid('Invalid user ID'),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience_level: z.enum(['junior', 'mid', 'senior', 'expert']).optional()
})

// Notification validation schemas
export const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  type: z.enum(['project_shared', 'project_updated', 'system', 'reminder']).default('system'),
  is_read: z.boolean().default(false),
  related_id: z.string().uuid('Invalid related ID').optional(),
  action_url: z.string().url('Invalid action URL').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  expires_at: z.string().optional()
})

// Form validation schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: nameSchema,
  lastName: nameSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  currency: z.string().min(3).max(3),
  teamMembers: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    role: z.string().min(1, 'Role is required'),
    location: z.string().optional(),
    monthlyAllocation: z.number().min(0).max(100),
    billingRate: z.number().positive('Billing rate must be positive'),
    currency: z.string().min(3).max(3),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })).min(1, 'At least one team member is required')
})

// Validation utility functions
export class ValidationService {
  // Client-side validation
  static validateForm<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: Record<string, string> } {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return { success: false, errors }
      }
      return { success: false, errors: { general: 'Validation failed' } }
    }
  }

  // Server-side validation with additional checks
  static async validateProjectData(data: any, userId: string): Promise<{ success: boolean; data?: any; errors?: Record<string, string> }> {
    try {
      // Basic schema validation
      const validation = this.validateForm(projectSchema, data)
      if (!validation.success) {
        return validation
      }

      // Additional business logic validation
      const errors: Record<string, string> = {}

      // Validate currency exists
      const currencyInfo = exchangeRateService.getCurrencyInfo(data.currency)
      if (!currencyInfo) {
        errors.currency = 'Unsupported currency'
      }

      // Validate team member data
      if (data.data?.teamMembers) {
        for (let i = 0; i < data.data.teamMembers.length; i++) {
          const member = data.data.teamMembers[i]
          
          // Check for duplicate names
          const duplicateNames = data.data.teamMembers.filter((m: any, index: number) => 
            m.name === member.name && index !== i
          )
          if (duplicateNames.length > 0) {
            errors[`data.teamMembers.${i}.name`] = 'Duplicate team member name'
          }

          // Validate allocation sum doesn't exceed 100%
          const totalAllocation = data.data.teamMembers.reduce((sum: number, m: any) => sum + m.monthlyAllocation, 0)
          if (totalAllocation > 100) {
            errors['data.teamMembers'] = 'Total allocation cannot exceed 100%'
          }

          // Validate dates
          if (member.startDate && member.endDate) {
            if (new Date(member.startDate) >= new Date(member.endDate)) {
              errors[`data.teamMembers.${i}.endDate`] = 'End date must be after start date'
            }
          }
        }
      }

      // Validate project dates
      if (data.data?.projectSettings?.startDate && data.data?.projectSettings?.endDate) {
        if (new Date(data.data.projectSettings.startDate) >= new Date(data.data.projectSettings.endDate)) {
          errors['data.projectSettings.endDate'] = 'Project end date must be after start date'
        }
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors }
      }

      return { success: true, data: validation.data }
    } catch (error) {
      return { success: false, errors: { general: 'Validation failed' } }
    }
  }

  // Sanitize input data
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  // Validate and sanitize user input
  static sanitizeUserInput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeUserInput(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  // Type-safe validation with TypeScript
  static createValidator<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): data is T => {
      return schema.safeParse(data).success
    }
  }

  // Async validation for external data
  static async validateExternalData<T>(schema: z.ZodSchema<T>, data: any): Promise<T> {
    const result = await schema.parseAsync(data)
    return result
  }

  // Error recovery and fallback
  static createFallbackValidator<T>(schema: z.ZodSchema<T>, fallback: T) {
    return (data: any): T => {
      try {
        return schema.parse(data)
      } catch (error) {
        console.warn('Validation failed, using fallback:', error)
        return fallback
      }
    }
  }
}

// Form validation hooks
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: any): { success: boolean; data?: T; errors?: Record<string, string> } => {
    return ValidationService.validateForm(schema, data)
  }

  const validateField = (fieldName: string, value: any): string | null => {
    try {
      const fieldSchema = schema.shape[fieldName as keyof z.infer<typeof schema>]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return null
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Invalid field'
      }
    }
    return null
  }

  return { validate, validateField }
}

// Export validation schemas
export {
  userSchema,
  userUpdateSchema,
  projectSchema,
  projectDataSchema,
  roleCatalogSchema,
  notificationSchema,
  loginFormSchema,
  signupFormSchema,
  projectFormSchema
} 