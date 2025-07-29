import type { User, Project, ProjectData, RoleCatalog, Notification, UserAuditLog, Permission, RolePermission, ProjectShare, ProjectTemplate } from './supabase'

// Mock data storage
let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'global_admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    role: 'user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
]

// Load mock data from localStorage if available
const loadMockData = () => {
  try {
    const storedProjects = localStorage.getItem('mockProjects')
    const storedRoleCatalog = localStorage.getItem('mockRoleCatalog')
    
    if (storedProjects) {
      mockProjects = JSON.parse(storedProjects)
    }
    if (storedRoleCatalog) {
      mockRoleCatalog = JSON.parse(storedRoleCatalog)
    }
  } catch (error) {
    console.warn('Failed to load mock data from localStorage:', error)
  }
}

// Save mock data to localStorage
const saveMockData = () => {
  try {
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects))
    localStorage.setItem('mockRoleCatalog', JSON.stringify(mockRoleCatalog))
  } catch (error) {
    console.warn('Failed to save mock data to localStorage:', error)
  }
}

// Initialize mock data
loadMockData()

let mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Website',
    description: 'Full-stack e-commerce platform with payment integration',
    user_id: '2',
    data: {
      roles: [
        {
          id: '1',
          name: 'Frontend Developer',
          role_id: '1',
          location: 'United States',
          hourly_rate: 75,
          bill_rate: 97.5,
          cost_rate: 60,
          monthly_allocation: 100,
          hours: 80,
          cost: 6000,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 2, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 3, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 4, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 5, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 6, allocation_percentage: 100, hours: 13.33, cost: 1000 }
          ]
        },
        {
          id: '2',
          name: 'Backend Developer',
          role_id: '2',
          location: 'United States',
          hourly_rate: 85,
          bill_rate: 110.5,
          cost_rate: 68,
          monthly_allocation: 100,
          hours: 100,
          cost: 8500,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 2, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 3, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 4, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 5, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 6, allocation_percentage: 100, hours: 16.67, cost: 1416.67 }
          ]
        },
        {
          id: '3',
          name: 'UI/UX Designer',
          role_id: '3',
          location: 'United States',
          hourly_rate: 65,
          bill_rate: 84.5,
          cost_rate: 52,
          monthly_allocation: 50,
          hours: 40,
          cost: 2600,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 50, hours: 3.33, cost: 216.67 },
            { month: 2, allocation_percentage: 50, hours: 3.33, cost: 216.67 },
            { month: 3, allocation_percentage: 50, hours: 3.33, cost: 216.67 },
            { month: 4, allocation_percentage: 50, hours: 3.33, cost: 216.67 },
            { month: 5, allocation_percentage: 50, hours: 3.33, cost: 216.67 },
            { month: 6, allocation_percentage: 50, hours: 3.33, cost: 216.67 }
          ]
        }
      ],
      total_cost: 17100,
      total_hours: 220,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 17100,
        total_billing: 22230,
        gross_margin: 5130,
        gross_margin_percentage: 23.1,
        blended_rate: 101.05,
        monthly_breakdown: [
          { month: 1, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 },
          { month: 2, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 },
          { month: 3, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 },
          { month: 4, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 },
          { month: 5, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 },
          { month: 6, total_cost: 2633.34, total_billing: 3423.34, margin: 790, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_shared: false,
    is_template: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    user_id: '2',
    data: {
      roles: [
        {
          id: '1',
          name: 'React Native Developer',
          role_id: '1',
          location: 'United States',
          hourly_rate: 90,
          bill_rate: 117,
          cost_rate: 72,
          monthly_allocation: 100,
          hours: 120,
          cost: 10800,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 2, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 3, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 4, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 5, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 6, allocation_percentage: 100, hours: 20, cost: 1800 }
          ]
        },
        {
          id: '2',
          name: 'Mobile Designer',
          role_id: '3',
          location: 'United States',
          hourly_rate: 70,
          bill_rate: 91,
          cost_rate: 56,
          monthly_allocation: 75,
          hours: 60,
          cost: 4200,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 75, hours: 7.5, cost: 525 },
            { month: 2, allocation_percentage: 75, hours: 7.5, cost: 525 },
            { month: 3, allocation_percentage: 75, hours: 7.5, cost: 525 },
            { month: 4, allocation_percentage: 75, hours: 7.5, cost: 525 },
            { month: 5, allocation_percentage: 75, hours: 7.5, cost: 525 },
            { month: 6, allocation_percentage: 75, hours: 7.5, cost: 525 }
          ]
        }
      ],
      total_cost: 15000,
      total_hours: 180,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 15000,
        total_billing: 19500,
        gross_margin: 4500,
        gross_margin_percentage: 23.1,
        blended_rate: 108.33,
        monthly_breakdown: [
          { month: 1, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 },
          { month: 2, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 },
          { month: 3, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 },
          { month: 4, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 },
          { month: 5, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 },
          { month: 6, total_cost: 2325, total_billing: 3022.5, margin: 697.5, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_shared: true,
    is_template: false,
    shared_with: ['user3', 'user4'],
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    description: 'Administrative dashboard for project management',
    user_id: '1',
    data: {
      roles: [
        {
          id: '1',
          name: 'Full Stack Developer',
          role_id: '1',
          location: 'United States',
          hourly_rate: 95,
          bill_rate: 123.5,
          cost_rate: 76,
          monthly_allocation: 100,
          hours: 60,
          cost: 5700,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 10, cost: 950 },
            { month: 2, allocation_percentage: 100, hours: 10, cost: 950 },
            { month: 3, allocation_percentage: 100, hours: 10, cost: 950 },
            { month: 4, allocation_percentage: 100, hours: 10, cost: 950 },
            { month: 5, allocation_percentage: 100, hours: 10, cost: 950 },
            { month: 6, allocation_percentage: 100, hours: 10, cost: 950 }
          ]
        },
        {
          id: '2',
          name: 'System Administrator',
          role_id: '4',
          location: 'United States',
          hourly_rate: 80,
          bill_rate: 104,
          cost_rate: 64,
          monthly_allocation: 50,
          hours: 40,
          cost: 3200,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 50, hours: 3.33, cost: 266.67 },
            { month: 2, allocation_percentage: 50, hours: 3.33, cost: 266.67 },
            { month: 3, allocation_percentage: 50, hours: 3.33, cost: 266.67 },
            { month: 4, allocation_percentage: 50, hours: 3.33, cost: 266.67 },
            { month: 5, allocation_percentage: 50, hours: 3.33, cost: 266.67 },
            { month: 6, allocation_percentage: 50, hours: 3.33, cost: 266.67 }
          ]
        }
      ],
      total_cost: 8900,
      total_hours: 100,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 8900,
        total_billing: 11570,
        gross_margin: 2670,
        gross_margin_percentage: 23.1,
        blended_rate: 115.7,
        monthly_breakdown: [
          { month: 1, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 },
          { month: 2, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 },
          { month: 3, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 },
          { month: 4, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 },
          { month: 5, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 },
          { month: 6, total_cost: 1216.67, total_billing: 1581.67, margin: 365, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_shared: false,
    is_template: false,
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-12T11:20:00Z',
  },
  {
    id: '4',
    name: 'API Development',
    description: 'RESTful API development for enterprise application',
    user_id: '1',
    data: {
      roles: [
        {
          id: '1',
          name: 'Backend Developer',
          role_id: '2',
          location: 'United States',
          hourly_rate: 85,
          bill_rate: 110.5,
          cost_rate: 68,
          monthly_allocation: 100,
          hours: 80,
          cost: 6800,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 13.33, cost: 1133.33 },
            { month: 2, allocation_percentage: 100, hours: 13.33, cost: 1133.33 },
            { month: 3, allocation_percentage: 100, hours: 13.33, cost: 1133.33 },
            { month: 4, allocation_percentage: 100, hours: 13.33, cost: 1133.33 },
            { month: 5, allocation_percentage: 100, hours: 13.33, cost: 1133.33 },
            { month: 6, allocation_percentage: 100, hours: 13.33, cost: 1133.33 }
          ]
        },
        {
          id: '2',
          name: 'DevOps Engineer',
          role_id: '4',
          location: 'United States',
          hourly_rate: 90,
          bill_rate: 117,
          cost_rate: 72,
          monthly_allocation: 25,
          hours: 30,
          cost: 2700,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 25, hours: 1.25, cost: 112.5 },
            { month: 2, allocation_percentage: 25, hours: 1.25, cost: 112.5 },
            { month: 3, allocation_percentage: 25, hours: 1.25, cost: 112.5 },
            { month: 4, allocation_percentage: 25, hours: 1.25, cost: 112.5 },
            { month: 5, allocation_percentage: 25, hours: 1.25, cost: 112.5 },
            { month: 6, allocation_percentage: 25, hours: 1.25, cost: 112.5 }
          ]
        },
        {
          id: '3',
          name: 'API Designer',
          role_id: '3',
          location: 'United States',
          hourly_rate: 75,
          bill_rate: 97.5,
          cost_rate: 60,
          monthly_allocation: 50,
          hours: 20,
          cost: 1500,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 50, hours: 1.67, cost: 125 },
            { month: 2, allocation_percentage: 50, hours: 1.67, cost: 125 },
            { month: 3, allocation_percentage: 50, hours: 1.67, cost: 125 },
            { month: 4, allocation_percentage: 50, hours: 1.67, cost: 125 },
            { month: 5, allocation_percentage: 50, hours: 1.67, cost: 125 },
            { month: 6, allocation_percentage: 50, hours: 1.67, cost: 125 }
          ]
        }
      ],
      total_cost: 11000,
      total_hours: 130,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 11000,
        total_billing: 14300,
        gross_margin: 3300,
        gross_margin_percentage: 23.1,
        blended_rate: 110,
        monthly_breakdown: [
          { month: 1, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 },
          { month: 2, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 },
          { month: 3, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 },
          { month: 4, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 },
          { month: 5, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 },
          { month: 6, total_cost: 1370.83, total_billing: 1782.08, margin: 411.25, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_shared: true,
    is_template: false,
    shared_with: ['user2'],
    created_at: '2024-01-08T14:00:00Z',
    updated_at: '2024-01-16T09:15:00Z',
  }
]

let mockRoleCatalog: RoleCatalog[] = [
  {
    id: '1',
    name: 'Frontend Developer',
    description: 'Develops user-facing features and interfaces',
    default_rate: 75,
    cost_rate: 60,
    bill_rate: 97.5,
    category: 'Development',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Backend Developer',
    description: 'Builds server-side logic and APIs',
    default_rate: 85,
    cost_rate: 68,
    bill_rate: 110.5,
    category: 'Development',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'UI/UX Designer',
    description: 'Creates user interfaces and user experience designs',
    default_rate: 65,
    cost_rate: 52,
    bill_rate: 84.5,
    category: 'Design',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Project Manager',
    description: 'Manages project timelines and team coordination',
    default_rate: 90,
    cost_rate: 72,
    bill_rate: 117,
    category: 'Management',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'DevOps Engineer',
    description: 'Manages infrastructure and deployment pipelines',
    default_rate: 95,
    cost_rate: 76,
    bill_rate: 123.5,
    category: 'Operations',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Data Scientist',
    description: 'Analyzes data and builds machine learning models',
    default_rate: 100,
    cost_rate: 80,
    bill_rate: 130,
    category: 'Analytics',
    location: 'United States',
    is_active: true,
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
]

let mockUserAuditLogs: UserAuditLog[] = [
  {
    id: '1',
    user_id: '2',
    action: 'role_change',
    old_value: 'user',
    new_value: 'role_admin',
    changed_by: '1',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    user_id: '1',
    action: 'login',
    changed_by: '1',
    created_at: '2024-01-20T14:30:00Z',
  }
]

let mockPermissions: Permission[] = [
  {
    id: '1',
    name: 'User Management',
    description: 'Can view and edit user profiles and roles',
    resource: 'users',
    action: 'manage'
  },
  {
    id: '2',
    name: 'Role Catalog Management',
    description: 'Can create, edit, and delete role catalog entries',
    resource: 'role_catalog',
    action: 'manage'
  },
  {
    id: '3',
    name: 'Project Management',
    description: 'Can create and manage projects',
    resource: 'projects',
    action: 'manage'
  },
  {
    id: '4',
    name: 'System Administration',
    description: 'Full system access and configuration',
    resource: 'system',
    action: 'admin'
  }
]

let mockRolePermissions: RolePermission[] = [
  // Global Admin permissions
  { id: '1', role: 'global_admin', permission_id: '1', granted: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '2', role: 'global_admin', permission_id: '2', granted: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '3', role: 'global_admin', permission_id: '3', granted: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '4', role: 'global_admin', permission_id: '4', granted: true, created_at: '2024-01-01T00:00:00Z' },
  
  // Role Admin permissions
  { id: '5', role: 'role_admin', permission_id: '2', granted: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '6', role: 'role_admin', permission_id: '3', granted: true, created_at: '2024-01-01T00:00:00Z' },
  
  // User permissions
  { id: '7', role: 'user', permission_id: '3', granted: true, created_at: '2024-01-01T00:00:00Z' }
]

let mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '2',
    title: 'Welcome!',
    message: 'Welcome to Project Cost Calculator. Start creating your first project!',
    type: 'info',
    is_read: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '3',
    title: 'Project Shared',
    message: 'E-commerce Website has been shared with you',
    type: 'project_shared',
    related_id: '2',
    is_read: false,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    user_id: '4',
    title: 'Project Shared',
    message: 'E-commerce Website has been shared with you with edit permissions',
    type: 'project_shared',
    related_id: '2',
    is_read: false,
    created_at: '2024-01-16T14:30:00Z',
  }
]

let mockProjectShares: ProjectShare[] = [
  {
    id: '1',
    project_id: '2',
    shared_by: '2',
    shared_with: '3',
    permission: 'view',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    project_id: '2',
    shared_by: '2',
    shared_with: '4',
    permission: 'edit',
    created_at: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    project_id: '4',
    shared_by: '1',
    shared_with: '2',
    permission: 'view',
    created_at: '2024-01-10T09:00:00Z',
  },
]

let mockProjectTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'E-commerce Template',
    description: 'Standard template for e-commerce projects',
    user_id: '1',
    data: {
      roles: [
        {
          id: '1',
          name: 'Frontend Developer',
          role_id: '1',
          location: 'United States',
          hourly_rate: 75,
          bill_rate: 97.5,
          cost_rate: 60,
          monthly_allocation: 100,
          hours: 80,
          cost: 6000,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 2, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 3, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 4, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 5, allocation_percentage: 100, hours: 13.33, cost: 1000 },
            { month: 6, allocation_percentage: 100, hours: 13.33, cost: 1000 }
          ]
        },
        {
          id: '2',
          name: 'Backend Developer',
          role_id: '2',
          location: 'United States',
          hourly_rate: 85,
          bill_rate: 110.5,
          cost_rate: 68,
          monthly_allocation: 100,
          hours: 100,
          cost: 8500,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 2, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 3, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 4, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 5, allocation_percentage: 100, hours: 16.67, cost: 1416.67 },
            { month: 6, allocation_percentage: 100, hours: 16.67, cost: 1416.67 }
          ]
        }
      ],
      total_cost: 14500,
      total_hours: 180,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 14500,
        total_billing: 18850,
        gross_margin: 4350,
        gross_margin_percentage: 23.1,
        blended_rate: 104.72,
        monthly_breakdown: [
          { month: 1, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 },
          { month: 2, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 },
          { month: 3, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 },
          { month: 4, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 },
          { month: 5, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 },
          { month: 6, total_cost: 2416.67, total_billing: 3141.67, margin: 725, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_public: true,
    category: 'E-commerce',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Mobile App Template',
    description: 'Template for mobile application development',
    user_id: '1',
    data: {
      roles: [
        {
          id: '1',
          name: 'React Native Developer',
          role_id: '1',
          location: 'United States',
          hourly_rate: 90,
          bill_rate: 117,
          cost_rate: 72,
          monthly_allocation: 100,
          hours: 120,
          cost: 10800,
          currency: 'USD',
          monthly_breakdown: [
            { month: 1, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 2, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 3, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 4, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 5, allocation_percentage: 100, hours: 20, cost: 1800 },
            { month: 6, allocation_percentage: 100, hours: 20, cost: 1800 }
          ]
        }
      ],
      total_cost: 10800,
      total_hours: 180,
      currency: 'USD',
      project_settings: {
        duration_months: 6,
        monthly_hours: 160,
        target_currency: 'USD',
        exchange_rate_base: 'USD'
      },
      calculations: {
        total_cost: 10800,
        total_billing: 14040,
        gross_margin: 3240,
        gross_margin_percentage: 23.1,
        blended_rate: 117,
        monthly_breakdown: [
          { month: 1, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 },
          { month: 2, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 },
          { month: 3, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 },
          { month: 4, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 },
          { month: 5, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 },
          { month: 6, total_cost: 1800, total_billing: 2340, margin: 540, margin_percentage: 23.1 }
        ]
      },
      exchange_rates: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        JPY: 110.5
      }
    },
    is_public: true,
    category: 'Mobile Development',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Mock current session
let currentSession: any = null
let currentUser: User | null = null

// Mock auth methods
const mockAuth = {
  getSession: async () => {
    return { data: { session: currentSession }, error: null }
  },
  
  signUp: async ({ email, password, options }: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      first_name: options?.data?.first_name || '',
      last_name: options?.data?.last_name || '',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    mockUsers.push(newUser)
    currentSession = { user: { id: newUser.id, email: newUser.email } }
    currentUser = newUser
    
    return { data: { user: { id: newUser.id, email: newUser.email } }, error: null }
  },
  
  signInWithPassword: async ({ email, password }: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      throw new Error('Invalid login credentials')
    }
    
    currentSession = { user: { id: user.id, email: user.email } }
    currentUser = user
    
    return { data: { user: { id: user.id, email: user.email } }, error: null }
  },
  
  signOut: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    currentSession = null
    currentUser = null
    
    return { error: null }
  },
  
  onAuthStateChange: (callback: any) => {
    // Simulate auth state change listener
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Mock database methods
const mockDb = {
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        let filteredData: any[] = []
        let isFiltered = false
        
        const queryBuilder = {
          eq: (column: string, value: any) => {
            isFiltered = true
            let data: any[] = []
            if (table === 'users') data = mockUsers
            else if (table === 'projects') data = mockProjects
            else if (table === 'role_catalog') data = mockRoleCatalog
            else if (table === 'notifications') data = mockNotifications
            else if (table === 'user_audit_logs') data = mockUserAuditLogs
            else if (table === 'permissions') data = mockPermissions
            else if (table === 'role_permissions') data = mockRolePermissions
            else if (table === 'project_shares') data = mockProjectShares
            else if (table === 'project_templates') data = mockProjectTemplates
            
            filteredData = data.filter(item => item[column as keyof any] === value)
            
            return {
              single: async () => {
                await new Promise(resolve => setTimeout(resolve, 300))
                const item = filteredData[0]
                return { data: item, error: item ? null : { message: 'Item not found' } }
              },
              order: (column: string, options: any) => {
                return {
                  async then(resolve: any) {
                    await new Promise(r => setTimeout(r, 300))
                    
                    let sortedData = [...filteredData]
                    if (options.ascending) {
                      sortedData.sort((a, b) => a[column] > b[column] ? 1 : -1)
                    } else {
                      sortedData.sort((a, b) => a[column] < b[column] ? 1 : -1)
                    }
                    
                    resolve({ data: sortedData, error: null })
                  }
                }
              },
              async then(resolve: any) {
                await new Promise(r => setTimeout(r, 300))
                resolve({ data: filteredData, error: null })
              }
            }
          },
          order: (column: string, options: any) => {
            return {
              async then(resolve: any) {
                await new Promise(r => setTimeout(r, 300))
                
                let data: any[] = []
                if (table === 'users') data = mockUsers
                else if (table === 'projects') data = mockProjects
                else if (table === 'role_catalog') data = mockRoleCatalog
                else if (table === 'notifications') data = mockNotifications
                else if (table === 'user_audit_logs') data = mockUserAuditLogs
                else if (table === 'permissions') data = mockPermissions
                else if (table === 'role_permissions') data = mockRolePermissions
                else if (table === 'project_shares') data = mockProjectShares
                else if (table === 'project_templates') data = mockProjectTemplates
                
                let sortedData = [...data]
                if (options.ascending) {
                  sortedData.sort((a, b) => a[column] > b[column] ? 1 : -1)
                } else {
                  sortedData.sort((a, b) => a[column] < b[column] ? 1 : -1)
                }
                
                resolve({ data: sortedData, error: null })
              }
            }
          },
          async then(resolve: any) {
            await new Promise(r => setTimeout(r, 300))
            
            let data: any[] = []
            if (table === 'users') data = mockUsers
            else if (table === 'projects') data = mockProjects
            else if (table === 'role_catalog') data = mockRoleCatalog
            else if (table === 'notifications') data = mockNotifications
            
            resolve({ data, error: null })
          }
        }
        
        return queryBuilder
      },
      
      insert: (data: any[]) => {
        return {
          async then(resolve: any) {
            await new Promise(r => setTimeout(r, 300))
            
            if (table === 'users') {
              mockUsers.push(...data)
            } else if (table === 'projects') {
              mockProjects.push(...data)
              saveMockData() // Save to localStorage when projects are added
            } else if (table === 'role_catalog') {
              mockRoleCatalog.push(...data)
              saveMockData() // Save to localStorage when role catalog is updated
            } else if (table === 'notifications') {
              mockNotifications.push(...data)
            } else if (table === 'user_audit_logs') {
              mockUserAuditLogs.push(...data)
            } else if (table === 'permissions') {
              mockPermissions.push(...data)
            } else if (table === 'role_permissions') {
              mockRolePermissions.push(...data)
            } else if (table === 'project_shares') {
              mockProjectShares.push(...data)
            } else if (table === 'project_templates') {
              mockProjectTemplates.push(...data)
            }
            
            resolve({ error: null })
          }
        }
      },
      
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              async then(resolve: any) {
                await new Promise(r => setTimeout(r, 300))
                
                if (table === 'users') {
                  const userIndex = mockUsers.findIndex(u => u[column as keyof User] === value)
                  if (userIndex !== -1) {
                    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates, updated_at: new Date().toISOString() }
                  }
                } else if (table === 'projects') {
                  const projectIndex = mockProjects.findIndex(p => p[column as keyof Project] === value)
                  if (projectIndex !== -1) {
                    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates, updated_at: new Date().toISOString() }
                    saveMockData() // Save to localStorage when projects are updated
                  }
                }
                
                resolve({ error: null })
              }
            }
          }
        }
      },
      
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return {
              async then(resolve: any) {
                await new Promise(r => setTimeout(r, 300))
                
                if (table === 'users') {
                  mockUsers = mockUsers.filter(u => u[column as keyof User] !== value)
                } else if (table === 'projects') {
                  mockProjects = mockProjects.filter(p => p[column as keyof Project] !== value)
                  saveMockData() // Save to localStorage when projects are deleted
                }
                
                resolve({ error: null })
              }
            }
          }
        }
      }
    }
  }
}

// Mock Supabase client
export const mockSupabase = {
  auth: mockAuth,
  from: mockDb.from,
  // Add any other methods you might need
}

// Helper function to get current user
export const getCurrentUser = () => currentUser

// Helper function to set current user (for testing)
export const setCurrentUser = (user: User | null) => {
  currentUser = user
  currentSession = user ? { user: { id: user.id, email: user.email } } : null
} 