import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Wrapper function that sets user and loading
  const setUser = (user: User | null) => {
    console.log('🔐 AuthContext: Setting user:', user ? user.id : 'null')
    setUserState(user)
    setLoading(false)
  }

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...')
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('🔐 AuthContext: Timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 seconds timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 AuthContext: Initial session:', session ? 'Found' : 'None')
      console.log('🔐 AuthContext: Session user:', session?.user)
      setSession(session)
      if (session?.user) {
        console.log('🔐 AuthContext: Fetching user for session:', session.user.id)
        fetchUser(session.user.id)
      } else {
        console.log('🔐 AuthContext: No session user, setting loading to false')
        setLoading(false)
      }
      clearTimeout(timeoutId)
    }).catch((error) => {
      console.error('🔐 AuthContext: Error getting session:', error)
      setLoading(false)
      clearTimeout(timeoutId)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthContext: Auth state changed:', event, session ? 'Session found' : 'No session')
      setSession(session)
      if (session?.user) {
        console.log('🔐 AuthContext: Fetching user after auth change:', session.user.id)
        await fetchUser(session.user.id)
      } else {
        console.log('🔐 AuthContext: Setting user to null')
        setUser(null) // This will automatically set loading to false
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const fetchUser = async (userId: string) => {
    try {
      console.log('🔐 AuthContext: Fetching user with ID:', userId)
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        console.error('🔐 AuthContext: Invalid UUID format:', userId)
        setLoading(false)
        return
      }

      console.log('🔐 AuthContext: Querying users table for ID:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('🔐 AuthContext: Error fetching user:', error)
        
        // If user doesn't exist in public.users, try to create it from auth.users
        if (error.code === 'PGRST116') {
          console.log('🔐 AuthContext: User not found in public.users, creating from auth.users...')
          await createUserFromAuth(userId)
        } else {
          console.error('🔐 AuthContext: Database error:', error)
          // Create fallback user to prevent infinite loading
          console.log('🔐 AuthContext: Creating fallback user object...')
          const fallbackUser: User = {
            id: userId,
            email: session?.user?.email || 'unknown@example.com',
            first_name: 'User',
            last_name: 'Unknown',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          }
          setUser(fallbackUser)
        }
        return
      }

      console.log('🔐 AuthContext: User fetched successfully:', data)
      console.log('🔐 AuthContext: User role:', data.role)
      setUser(data) // This will automatically set loading to false
    } catch (error) {
      console.error('🔐 AuthContext: Error fetching user:', error)
      // Create fallback user to prevent infinite loading
      const fallbackUser: User = {
        id: userId,
        email: session?.user?.email || 'unknown@example.com',
        first_name: 'User',
        last_name: 'Unknown',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
      setUser(fallbackUser)
    }
  }

  const createUserFromAuth = async (userId: string) => {
    try {
      console.log('🔐 AuthContext: Creating user from auth for ID:', userId)
      
      // Get current session user data
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.error('🔐 AuthContext: No session user found')
        setLoading(false)
        return
      }

      console.log('🔐 AuthContext: Session user data:', {
        id: session.user.id,
        email: session.user.email,
        metadata: session.user.user_metadata
      })

      // Create user profile using session data
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: session.user.id,
            email: session.user.email!,
            first_name: session.user.user_metadata?.first_name || 'Unknown',
            last_name: session.user.user_metadata?.last_name || 'User',
            role: 'user',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

      if (profileError) {
        console.error('🔐 AuthContext: Error creating user profile:', profileError)
        
        // If user already exists, try to fetch it
        if (profileError.code === '23505') { // Unique violation
          console.log('🔐 AuthContext: User already exists, fetching...')
          await fetchUser(userId)
          return
        }
        
        setLoading(false)
        return
      }

      console.log('🔐 AuthContext: User profile created successfully')
      
      // Fetch the user again
      await fetchUser(userId)
    } catch (error) {
      console.error('🔐 AuthContext: Error creating user from auth:', error)
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        console.log('User created in auth:', data.user.id)
        
        // Create user profile with proper UUID handling
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              first_name: firstName,
              last_name: lastName,
              role: 'user', // Default role
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }
        
        console.log('User profile created successfully')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, ...updates })
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    setUser,
    setSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 