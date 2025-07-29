import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { Landing } from './pages/Landing'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { Admin } from './pages/Admin'
import { Profile } from './pages/Profile'
import { Help } from './pages/Help'
import { Twilio } from './pages/Twilio'
import { Email } from './pages/Email'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('🔒 ProtectedRoute:', { user: !!user, loading, userId: user?.id })

  if (loading) {
    console.log('🔒 ProtectedRoute: Still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('🔒 ProtectedRoute: No user, redirecting to auth')
    return <Navigate to="/auth" replace />
  }

  console.log('🔒 ProtectedRoute: User authenticated, rendering children')
  return <>{children}</>
}

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()

  if (!user || (user.role !== 'global_admin' && user.role !== 'role_admin')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />
      
      {/* Protected Routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Layout>
            <Home />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout>
            <Projects />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <Layout>
              <Admin />
            </Layout>
          </AdminRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/help" element={
        <ProtectedRoute>
          <Layout>
            <Help />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/twilio" element={
        <ProtectedRoute>
          <Layout>
            <Twilio />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/email" element={
        <ProtectedRoute>
          <Layout>
            <Email />
          </Layout>
        </ProtectedRoute>
      } />
      

      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
