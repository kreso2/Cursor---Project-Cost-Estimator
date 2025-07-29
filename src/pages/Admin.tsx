import React, { useState, useEffect, useCallback } from 'react'
import { Users, Shield, Plus, Edit, Trash2, Search, Save, X, KeyRound, ListChecks, Activity, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { User, RoleCatalog, AuditLog } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleCatalog[]>([])
  const [permissions, setPermissions] = useState<any[]>([]) // Changed from Permission[] to any[]
  const [rolePermissions, setRolePermissions] = useState<any[]>([]) // Changed from RolePermission[] to any[]
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]) // Changed from UserAuditLog[] to AuditLog[]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRole, setEditingRole] = useState<RoleCatalog | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user' as const,
    password: ''
  })
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    base_rate: 0,
    currency: 'USD',
    location_variations: {},
    category: '',
    is_active: true
  })
  const { user: currentUser } = useAuth()

  console.log('🔐 Admin: Current user:', currentUser)
  console.log('🔐 Admin: User role:', currentUser?.role)

  const fetchData = useCallback(() => {
    console.log('🔐 Admin fetchData: Starting...')
    console.log('🔐 Admin fetchData: Current user role =', currentUser?.role)
    setLoading(true)
    const promises = []
    
    if (currentUser?.role === 'global_admin') {
      console.log('🔐 Admin fetchData: Fetching users and audit logs...')
      promises.push(
        supabase.from('users').select('*').then((result) => {
          console.log('🔐 Admin fetchData: Users result =', result)
          if (result.error) {
            console.error('🔐 Admin fetchData: Users error =', result.error)
          } else {
            setUsers(result.data || [])
          }
        }).catch((error) => {
          console.error('🔐 Admin fetchData: Users catch error =', error)
        })
      )
      promises.push(
        supabase.from('audit_logs').select('*').then((result) => {
          console.log('🔐 Admin fetchData: Audit logs result =', result)
          if (result.error) {
            console.error('🔐 Admin fetchData: Audit logs error =', result.error)
          } else {
            setAuditLogs(result.data || [])
          }
        }).catch((error) => {
          console.error('🔐 Admin fetchData: Audit logs catch error =', error)
        })
      )
    }
    
    if (currentUser?.role === 'global_admin' || currentUser?.role === 'role_admin') {
      console.log('🔐 Admin fetchData: Fetching roles...')
      promises.push(
        supabase.from('role_catalog').select('*').then((result) => {
          console.log('🔐 Admin fetchData: Roles result =', result)
          if (result.error) {
            console.error('🔐 Admin fetchData: Roles error =', result.error)
          } else {
            setRoles((result.data || []).sort((a, b) => a.name.localeCompare(b.name)))
          }
        }).catch((error) => {
          console.error('🔐 Admin fetchData: Roles catch error =', error)
        })
      )
    }
    
    if (currentUser?.role === 'global_admin') {
      console.log('🔐 Admin fetchData: Fetching permissions...')
      promises.push(
        supabase.from('permissions').select('*').then((result) => {
          console.log('🔐 Admin fetchData: Permissions result =', result)
          if (result.error) {
            console.error('🔐 Admin fetchData: Permissions error =', result.error)
          } else {
            setPermissions(result.data || [])
          }
        }).catch((error) => {
          console.error('🔐 Admin fetchData: Permissions catch error =', error)
        })
      )
      promises.push(
        supabase.from('role_permissions').select('*').then((result) => {
          console.log('🔐 Admin fetchData: Role permissions result =', result)
          if (result.error) {
            console.error('🔐 Admin fetchData: Role permissions error =', result.error)
          } else {
            setRolePermissions(result.data || [])
          }
        }).catch((error) => {
          console.error('🔐 Admin fetchData: Role permissions catch error =', error)
        })
      )
    }
    
    console.log('🔐 Admin fetchData: Executing', promises.length, 'promises...')
    Promise.all(promises).finally(() => {
      console.log('🔐 Admin fetchData: All promises completed, setting loading to false')
      setLoading(false)
    })
  }, [currentUser?.role])

  // Fetch all data on mount or role change
  useEffect(() => {
    console.log('🔐 Admin useEffect: currentUser =', currentUser)
    console.log('🔐 Admin useEffect: user role =', currentUser?.role)
    
    if (currentUser?.role === 'global_admin' || currentUser?.role === 'role_admin') {
      console.log('🔐 Admin useEffect: Fetching data...')
      fetchData()
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('🔐 Admin useEffect: Timeout reached, setting loading to false')
        setLoading(false)
      }, 10000) // 10 seconds timeout
      
      return () => clearTimeout(timeout)
    } else {
      console.log('🔐 Admin useEffect: No admin role, skipping data fetch')
      setLoading(false)
    }
  }, [currentUser?.id, currentUser?.role, fetchData])

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.password) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Create user using regular signUp instead of admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
          },
        },
      })

      if (authError) {
        console.error('Auth error:', authError)
        toast.error(authError.message)
        return
      }

      if (authData.user) {
        // Create user profile in public.users
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              role: newUser.role,
              is_active: true,
            },
          ])

        if (profileError) {
          console.error('Profile error:', profileError)
          toast.error('Failed to create user profile')
          return
        }

        toast.success('User created successfully!')
        setShowAddUserModal(false)
        setNewUser({
          email: '',
          first_name: '',
          last_name: '',
          role: 'user',
          password: ''
        })
        fetchData() // Refresh the list
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  const handleUpdateUserRole = (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .then((result) => {
        if (result.error) {
          console.error('Error updating user:', result.error)
          toast.error('Failed to update user role')
          return
        }
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
        toast.success('User role updated successfully')
      })
      .catch((error) => {
        console.error('Error updating user:', error)
        toast.error('Failed to update user role')
      })
  }

  const handleSaveRole = () => {
    if (!editingRole) return

    if (!editingRole.name.trim() || editingRole.base_rate <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    supabase
      .from('role_catalog')
      .update({
        name: editingRole.name,
        description: editingRole.description,
        base_rate: editingRole.base_rate,
        category: editingRole.category
      })
      .eq('id', editingRole.id)
      .then((result) => {
        if (result.error) {
          console.error('Error updating role:', result.error)
          toast.error('Failed to update role')
          return
        }
        setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r))
        setEditingRole(null)
        toast.success('Role updated successfully')
      })
      .catch((error) => {
        console.error('Error updating role:', error)
        toast.error('Failed to update role')
      })
  }

  const handleCreateRole = () => {
    console.log('🔐 Admin: handleCreateRole called with newRole:', newRole)
    if (!newRole.name.trim() || newRole.base_rate <= 0 || !newRole.category.trim()) {
      console.log('🔐 Admin: Validation failed - name:', newRole.name.trim(), 'base_rate:', newRole.base_rate, 'category:', newRole.category.trim())
      toast.error('Please fill in all required fields')
      return
    }

    supabase
      .from('role_catalog')
      .insert([{
        name: newRole.name,
        description: newRole.description,
        base_rate: newRole.base_rate,
        category: newRole.category,
        created_by: currentUser?.id
      }])
      .then((result) => {
        if (result.error) {
          console.error('Error creating role:', result.error)
          toast.error('Failed to create role')
          return
        }
        setNewRole({ name: '', description: '', base_rate: 0, currency: 'USD', location_variations: {}, category: '', is_active: true })
        fetchData() // Refresh the list
        toast.success('Role created successfully')
      })
      .catch((error) => {
        console.error('Error creating role:', error)
        toast.error('Failed to create role')
      })
  }

  const handleDeleteRole = (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    supabase
      .from('role_catalog')
      .delete()
      .eq('id', roleId)
      .then((result) => {
        if (result.error) {
          console.error('Error deleting role:', result.error)
          toast.error('Failed to delete role')
          return
        }
        setRoles(roles.filter(r => r.id !== roleId))
        toast.success('Role deleted successfully')
      })
      .catch((error) => {
        console.error('Error deleting role:', error)
        toast.error('Failed to delete role')
      })
  }

  // Permission matrix handlers
  const handlePermissionChange = (role: string, permissionId: string, granted: boolean) => {
    // Find if exists
    const existing = rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId)
    if (existing) {
      // Update
      supabase.from('role_permissions').update({ granted }).eq('id', existing.id).then(() => {
        setRolePermissions(rps => rps.map(rp => rp.id === existing.id ? { ...rp, granted } : rp))
        toast.success('Permission updated')
      })
    } else {
      // Insert
      supabase.from('role_permissions').insert([{ role, permission_id: permissionId, granted, created_at: new Date().toISOString() }]).then(() => {
        fetchData()
        toast.success('Permission granted')
      })
    }
  }

  // Access control helpers
  const canViewUsers = currentUser?.role === 'global_admin'
  const canViewRoles = currentUser?.role === 'global_admin' || currentUser?.role === 'role_admin'
  const canViewPermissions = currentUser?.role === 'global_admin'
  const canViewAudit = currentUser?.role === 'global_admin'

  // Check if user has any admin access
  const hasAnyAdminAccess = canViewUsers || canViewRoles || canViewPermissions || canViewAudit

  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.category && role.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          {error && (
            <p className="text-red-600 dark:text-red-400 mt-2 text-sm">{error}</p>
          )}
        </div>
      </div>
    )
  }

  // Show access denied message if user has no admin permissions
  if (!hasAnyAdminAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, roles, permissions, and system settings.
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Access Denied</h3>
              <p className="text-red-700 dark:text-red-300">
                You don't have permission to access the Admin Dashboard. 
                Only users with <strong>global_admin</strong> or <strong>role_admin</strong> roles can access this area.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Your current role: <strong>{currentUser?.role || 'Unknown'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, roles, permissions, and system settings.
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {canViewUsers && (
            <button onClick={() => setActiveTab('users')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              <Users className="h-4 w-4 inline mr-2" /> Users
            </button>
          )}
          {canViewRoles && (
            <button onClick={() => setActiveTab('roles')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              <Shield className="h-4 w-4 inline mr-2" /> Role Catalog
            </button>
          )}
          {canViewPermissions && (
            <button onClick={() => setActiveTab('permissions')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              <KeyRound className="h-4 w-4 inline mr-2" /> Permission Matrix
            </button>
          )}
          {canViewAudit && (
            <button onClick={() => setActiveTab('audit')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'audit' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}>
              <Activity className="h-4 w-4 inline mr-2" /> Audit Trail
            </button>
          )}
        </nav>
      </div>
      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && canViewUsers && (
            <UserManagementTab 
              users={users} 
              auditLogs={auditLogs} 
              onRoleChange={handleUpdateUserRole} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              currentUser={currentUser}
              showAddUserModal={showAddUserModal}
              setShowAddUserModal={setShowAddUserModal}
              newUser={newUser}
              setNewUser={setNewUser}
              onAddUser={handleAddUser}
            />
          )}
          {/* Roles Tab */}
          {activeTab === 'roles' && canViewRoles && (
            <RoleCatalogTab roles={roles} editingRole={editingRole} setEditingRole={setEditingRole} newRole={newRole} setNewRole={setNewRole} onSaveRole={handleSaveRole} onCreateRole={handleCreateRole} onDeleteRole={handleDeleteRole} searchTerm={searchTerm} setSearchTerm={setSearchTerm} currentUser={currentUser} />
          )}
          {/* Permission Matrix Tab */}
          {activeTab === 'permissions' && canViewPermissions && (
            <PermissionMatrixTab permissions={permissions} roles={['global_admin','role_admin','user']} rolePermissions={rolePermissions} onPermissionChange={handlePermissionChange} />
          )}
          {/* Audit Trail Tab */}
          {activeTab === 'audit' && canViewAudit && (
            <AuditTrailTab auditLogs={auditLogs} users={users} />
          )}
        </>
      )}
    </div>
  )
}

// User Management Tab
const UserManagementTab: React.FC<{
  users: User[]
  auditLogs: AuditLog[]
  onRoleChange: (userId: string, newRole: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentUser: User | null
  showAddUserModal: boolean
  setShowAddUserModal: (show: boolean) => void
  newUser: any
  setNewUser: (user: any) => void
  onAddUser: () => void
}> = ({ users, auditLogs, onRoleChange, searchTerm, setSearchTerm, currentUser, showAddUserModal, setShowAddUserModal, newUser, setNewUser, onAddUser }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>
      <button
        onClick={() => setShowAddUserModal(true)}
        className="btn-primary flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Add User
      </button>
    </div>
    <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.first_name} {user.last_name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={e => onRoleChange(user.id, e.target.value)}
                  className="text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={user.id === currentUser?.id}
                >
                  <option value="user">User</option>
                  <option value="role_admin">Role Admin</option>
                  <option value="global_admin">Global Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {user.id === currentUser?.id ? 'Current User' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Audit Trail (Role Changes)</h2>
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Old Value</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Value</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changed By</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {auditLogs.filter(log => log.action === 'role_change').map(log => (
              <tr key={log.id}>
                <td className="px-4 py-2">{log.user_id}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.old_values ? JSON.stringify(log.old_values) : 'N/A'}</td>
                <td className="px-4 py-2">{log.new_values ? JSON.stringify(log.new_values) : 'N/A'}</td>
                <td className="px-4 py-2">{log.user_id}</td>
                <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Add User Modal */}
    {showAddUserModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New User</h3>
            <button 
              onClick={() => setShowAddUserModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="input-field w-full"
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={newUser.first_name}
                onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
                className="input-field w-full"
                placeholder="John"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={newUser.last_name}
                onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
                className="input-field w-full"
                placeholder="Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                className="input-field w-full"
              >
                <option value="user">User</option>
                <option value="role_admin">Role Admin</option>
                <option value="global_admin">Global Admin</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onAddUser}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)

// Role Catalog Tab
const RoleCatalogTab: React.FC<{
  roles: RoleCatalog[]
  editingRole: RoleCatalog | null
  setEditingRole: (role: RoleCatalog | null) => void
  newRole: any
  setNewRole: (role: any) => void
  onSaveRole: () => void
  onCreateRole: () => void
  onDeleteRole: (roleId: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentUser: User | null
}> = ({ roles, editingRole, setEditingRole, newRole, setNewRole, onSaveRole, onCreateRole, onDeleteRole, searchTerm, setSearchTerm, currentUser }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>
      {currentUser?.role === 'global_admin' || currentUser?.role === 'role_admin' ? (
        <button 
          onClick={() => {
            console.log('🔐 Admin: Add Role button clicked')
            const newRoleData = { name: 'New Role', description: '', base_rate: 0, currency: 'USD', location_variations: {}, category: '', is_active: true }
            console.log('🔐 Admin: Setting newRole to:', newRoleData)
            setNewRole(newRoleData)
          }} 
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Role
        </button>
      ) : null}
    </div>
    {/* New Role Form */}
    {console.log('🔐 Admin: newRole state:', newRole)}
    {newRole.name !== '' && (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Role</h3>
          <button onClick={() => setNewRole({ name: '', description: '', base_rate: 0, currency: 'USD', location_variations: {}, category: '', is_active: true })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name *</label>
            <input type="text" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} className="input-field" placeholder="e.g., Senior Developer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
            <select value={newRole.currency} onChange={e => setNewRole({ ...newRole, currency: e.target.value })} className="input-field">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <input type="text" value={newRole.category} onChange={e => setNewRole({ ...newRole, category: e.target.value })} className="input-field" placeholder="e.g., Development, Design" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Rate (USD/hr) *</label>
            <input type="number" value={newRole.base_rate} onChange={e => setNewRole({ ...newRole, base_rate: parseFloat(e.target.value) || 0 })} className="input-field" placeholder="0.00" min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Variations</label>
            <input type="text" value={JSON.stringify(newRole.location_variations)} onChange={e => setNewRole({ ...newRole, location_variations: JSON.parse(e.target.value || '{}') })} className="input-field" placeholder="{}" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active</label>
            <input type="checkbox" checked={newRole.is_active} onChange={e => setNewRole({ ...newRole, is_active: e.target.checked })} className="form-checkbox h-5 w-5 text-primary-600" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input type="text" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} className="input-field" placeholder="Role description" />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={() => setNewRole({ name: '', description: '', base_rate: 0, currency: 'USD', location_variations: {}, category: '', is_active: true })} className="btn-secondary">Cancel</button>
          <button onClick={onCreateRole} className="btn-primary"><Save className="h-4 w-4 mr-2" />Create Role</button>
        </div>
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map(role => (
        <div key={role.id} className="card p-6">
          {editingRole?.id === role.id ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Role</h3>
                <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name *</label>
                  <input type="text" value={editingRole.name} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <input type="text" value={editingRole.category} onChange={e => setEditingRole({ ...editingRole, category: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Rate (USD/hr) *</label>
                  <input type="number" value={editingRole.base_rate} onChange={e => setEditingRole({ ...editingRole, base_rate: parseFloat(e.target.value) || 0 })} className="input-field" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Variations</label>
                  <input type="text" value={JSON.stringify(editingRole.location_variations)} onChange={e => setEditingRole({ ...editingRole, location_variations: JSON.parse(e.target.value || '{}') })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active</label>
                  <input type="checkbox" checked={editingRole.is_active} onChange={e => setEditingRole({ ...editingRole, is_active: e.target.checked })} className="form-checkbox h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <input type="text" value={editingRole.description || ''} onChange={e => setEditingRole({ ...editingRole, description: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setEditingRole(null)} className="btn-secondary">Cancel</button>
                <button onClick={onSaveRole} className="btn-primary"><Save className="h-4 w-4 mr-2" />Save</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{role.category}</p>
                  {role.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{role.is_active ? '(Active)' : '(Inactive)'}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingRole(role)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => onDeleteRole(role.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">${role.base_rate}/hr</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Currency: {role.currency}</div>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
)

// Permission Matrix Tab
const PermissionMatrixTab: React.FC<{
  permissions: any[]
  roles: string[]
  rolePermissions: any[]
  onPermissionChange: (role: string, permissionId: string, granted: boolean) => void
}> = ({ permissions, roles, rolePermissions, onPermissionChange }) => (
  <div className="card overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permission</th>
          {roles.map(role => (
            <th key={role} className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{role.replace('_', ' ')}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {permissions.map(permission => (
          <tr key={permission.id}>
            <td className="px-4 py-2">{permission.name}<div className="text-xs text-gray-400">{permission.description}</div></td>
            {roles.map(role => {
              const rp = rolePermissions.find(rp => rp.role === role && rp.permission_id === permission.id)
              return (
                <td key={role} className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!(rp && rp.granted)}
                    onChange={e => onPermissionChange(role, permission.id, e.target.checked)}
                    className="form-checkbox h-5 w-5 text-primary-600"
                  />
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Audit Trail Tab
const AuditTrailTab: React.FC<{
  auditLogs: AuditLog[]
  users: User[]
}> = ({ auditLogs, users }) => (
  <div className="card overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Old Value</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Value</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changed By</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {auditLogs.map(log => (
          <tr key={log.id}>
            <td className="px-4 py-2">{log.user_id}</td>
            <td className="px-4 py-2">{log.action}</td>
            <td className="px-4 py-2">{log.old_values ? JSON.stringify(log.old_values) : 'N/A'}</td>
            <td className="px-4 py-2">{log.new_values ? JSON.stringify(log.new_values) : 'N/A'}</td>
            <td className="px-4 py-2">{log.user_id}</td>
            <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) 