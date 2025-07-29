import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export const MockLogin: React.FC = () => {
  const { signIn, setUser, session, setSession } = useAuth()

  const mockUsers = [
    { 
      email: 'admin@test.com', 
      password: 'test123456', 
      role: 'global_admin', 
      firstName: 'Admin', 
      lastName: 'User',
      id: '7c11badb-a18a-4187-b3ce-7937f786cb91' // Pravi UUID iz baze
    },
    { 
      email: 'user@test.com', 
      password: 'test123456', 
      role: 'user', 
      firstName: 'Regular', 
      lastName: 'User',
      id: '00000000-0000-0000-0000-000000000002' // Mock UUID za test user
    },
    { 
      email: 'roleadmin@test.com', 
      password: 'test123456', 
      role: 'role_admin', 
      firstName: 'Role', 
      lastName: 'Admin',
      id: '00000000-0000-0000-0000-000000000003' // Mock UUID za role admin
    },
  ]

  const handleMockLogin = async (email: string, password: string) => {
    try {
      // Find the user in mock data
      const mockUserData = mockUsers.find(u => u.email === email)
      if (!mockUserData) {
        throw new Error('User not found')
      }
      
      // Create a mock user object with proper UUID
      const mockUser: User = {
        id: mockUserData.id,
        email: mockUserData.email,
        first_name: mockUserData.firstName,
        last_name: mockUserData.lastName,
        role: mockUserData.role as 'global_admin' | 'role_admin' | 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      
      console.log('Mock login with user:', mockUser)
      
      // Set the current user and session directly in AuthContext
      setUser(mockUser)
      setSession({ user: { id: mockUser.id, email: mockUser.email } } as Session)
      
      // Force loading to false
      setTimeout(() => {
        console.log('Mock login: Forcing loading to false')
        // We need to access setLoading from AuthContext
        // This is a workaround - the setUser wrapper should handle this
      }, 100)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          🧪 Mock Login (Development Only)
        </h3>
        <div className="space-y-2">
          {mockUsers.map((user) => (
            <button
              key={user.email}
              onClick={() => handleMockLogin(user.email, user.password)}
              className="w-full text-left px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Role: {user.role.replace('_', ' ')}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click any user to login instantly
        </p>
      </div>
    </div>
  )
} 