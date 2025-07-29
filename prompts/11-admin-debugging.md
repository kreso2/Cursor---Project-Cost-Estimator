# 11 - Admin Debugging & Testing

## Admin Debugging Overview
Create comprehensive debugging and testing tools for the admin system to identify and resolve issues with user management, role catalog, and permissions.

## Core Requirements
- Debug admin page loading issues
- Test database table access and permissions
- Verify user authentication and role assignment
- Monitor API calls and error responses
- Provide detailed error reporting

## Implementation Details

### Admin Debugging Tools
```typescript
// Console-based debugging approach
// Use browser console and network tab for debugging
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface TableTestResult {
  tableName: string;
  success: boolean;
  error?: string;
  recordCount?: number;
  sampleData?: any[];
}

interface UserTestResult {
  currentUser: any;
  userRole: string;
  permissions: string[];
  isAdmin: boolean;
}

export const AdminTest: React.FC = () => {
  const { user, loading } = useAuth();
  const [tableResults, setTableResults] = useState<TableTestResult[]>([]);
  const [userResult, setUserResult] = useState<UserTestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user) {
      runUserTests();
      runTableTests();
    }
  }, [user]);

  const runUserTests = async () => {
    if (!user) return;

    try {
      // Test current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('🔐 AdminTest: User fetch error:', userError);
        setUserResult({
          currentUser: user,
          userRole: 'unknown',
          permissions: [],
          isAdmin: false,
          error: userError.message
        });
        return;
      }

      console.log('🔐 AdminTest: User data:', userData);
      
      setUserResult({
        currentUser: userData,
        userRole: userData.role || 'user',
        permissions: getPermissionsForRole(userData.role),
        isAdmin: userData.role === 'global_admin' || userData.role === 'role_admin'
      });

    } catch (error) {
      console.error('🔐 AdminTest: User test error:', error);
      setUserResult({
        currentUser: user,
        userRole: 'error',
        permissions: [],
        isAdmin: false,
        error: error.message
      });
    }
  };

  const runTableTests = async () => {
    setTesting(true);
    const results: TableTestResult[] = [];

    // Test users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      results.push({
        tableName: 'users',
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
    } catch (error) {
      results.push({
        tableName: 'users',
        success: false,
        error: error.message
      });
    }

    // Test role_catalog table
    try {
      const { data, error } = await supabase
        .from('role_catalog')
        .select('*')
        .limit(5);

      results.push({
        tableName: 'role_catalog',
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
    } catch (error) {
      results.push({
        tableName: 'role_catalog',
        success: false,
        error: error.message
      });
    }

    // Test permissions table
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .limit(5);

      results.push({
        tableName: 'permissions',
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
    } catch (error) {
      results.push({
        tableName: 'permissions',
        success: false,
        error: error.message
      });
    }

    // Test role_permissions table
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .limit(5);

      results.push({
        tableName: 'role_permissions',
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
    } catch (error) {
      results.push({
        tableName: 'role_permissions',
        success: false,
        error: error.message
      });
    }

    // Test audit_logs table
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .limit(5);

      results.push({
        tableName: 'audit_logs',
        success: !error,
        error: error?.message,
        recordCount: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });
    } catch (error) {
      results.push({
        tableName: 'audit_logs',
        success: false,
        error: error.message
      });
    }

    setTableResults(results);
    setTesting(false);
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'global_admin':
        return ['all'];
      case 'role_admin':
        return ['view_users', 'manage_roles', 'view_audit_logs'];
      case 'user':
        return ['view_own_projects'];
      default:
        return [];
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Debugging & Testing</h1>
        <p className="text-gray-600">Comprehensive testing tools for admin system diagnostics</p>
      </div>

      {/* User Information */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        {userResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <div className="mt-1 flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {userResult.currentUser.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(userResult.currentUser.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userResult.userRole === 'global_admin' ? 'bg-red-100 text-red-800' :
                    userResult.userRole === 'role_admin' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {userResult.userRole}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Permissions</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {userResult.permissions.map(permission => (
                  <span key={permission} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            {userResult.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {userResult.error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading user data...</p>
          </div>
        )}
      </div>

      {/* Table Access Tests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Database Table Access</h2>
          <button
            onClick={runTableTests}
            disabled={testing}
            className="btn-primary"
          >
            {testing ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {tableResults.map(result => (
            <div key={result.tableName} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{result.tableName}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>

              {result.success ? (
                <div className="text-sm text-gray-600">
                  <p>Records: {result.recordCount}</p>
                  {result.sampleData && result.sampleData.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Sample Data
                      </summary>
                      <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.sampleData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Debug Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              console.log('🔐 AdminTest: Current user:', user);
              console.log('🔐 AdminTest: User result:', userResult);
              console.log('🔐 AdminTest: Table results:', tableResults);
              toast.success('Debug info logged to console');
            }}
            className="btn-secondary"
          >
            Log Debug Info
          </button>
          
          <button
            onClick={() => {
              const debugData = {
                user: userResult,
                tables: tableResults,
                timestamp: new Date().toISOString()
              };
              copyToClipboard(JSON.stringify(debugData, null, 2));
            }}
            className="btn-secondary"
          >
            Export Debug Data
          </button>
        </div>
      </div>

      {/* Common Issues */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-yellow-400 pl-4">
            <h3 className="font-medium text-yellow-800">Missing Tables</h3>
            <p className="text-sm text-gray-600 mt-1">
              If tables show as failed, run the SQL scripts from the setup guides.
            </p>
          </div>
          
          <div className="border-l-4 border-red-400 pl-4">
            <h3 className="font-medium text-red-800">Permission Denied</h3>
            <p className="text-sm text-gray-600 mt-1">
              Check RLS policies and ensure user has proper role assignment.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-400 pl-4">
            <h3 className="font-medium text-blue-800">User Not Found</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verify user exists in public.users table and has correct UUID format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Auth Test Component
```typescript
// AuthTest.tsx - Authentication debugging component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const AuthTest: React.FC = () => {
  const { user, loading, session } = useAuth();
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetchAuthData();
  }, []);

  const fetchAuthData = async () => {
    setAuthLoading(true);
    
    try {
      // Get current session directly from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 AuthTest: Direct session fetch:', sessionData, sessionError);
      setCurrentSession(sessionData.session);

      // Get current user directly from Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('🔐 AuthTest: Direct user fetch:', userData, userError);
      setCurrentUser(userData.user);

    } catch (error) {
      console.error('🔐 AuthTest: Auth data fetch error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Debugging</h1>
        <p className="text-gray-600">Test authentication state and Supabase auth calls</p>
      </div>

      {/* AuthContext State */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loading State</label>
            <div className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'Loading...' : 'Loaded'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <div className="mt-1">
              {user ? (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-500">No user</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session</label>
            <div className="mt-1">
              {session ? (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-500">No session</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Supabase Calls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Direct Supabase Auth Calls</h2>
          <button
            onClick={fetchAuthData}
            disabled={authLoading}
            className="btn-primary"
          >
            {authLoading ? 'Fetching...' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Session</label>
            <div className="mt-1">
              {currentSession ? (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(currentSession, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-500">No session found</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current User</label>
            <div className="mt-1">
              {currentUser ? (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(currentUser, null, 2)}
                </pre>
              ) : (
                <span className="text-gray-500">No user found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              console.log('🔐 AuthTest: AuthContext state:', { user, loading, session });
              console.log('🔐 AuthTest: Direct Supabase state:', { currentSession, currentUser });
            }}
            className="btn-secondary"
          >
            Log to Console
          </button>
          
          <button
            onClick={() => {
              supabase.auth.signOut();
            }}
            className="btn-secondary"
          >
            Sign Out
          </button>
          
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="btn-secondary"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Debugging Features
- **User Role Testing**: Verify user roles and permissions
- **Table Access Testing**: Test database table access
- **API Call Monitoring**: Monitor Supabase API calls
- **Error Reporting**: Detailed error messages and suggestions
- **Data Export**: Export debug data for analysis

## Common Issues
- **Missing Tables**: Run SQL setup scripts
- **Permission Denied**: Check RLS policies
- **User Not Found**: Verify user exists in database
- **Authentication Issues**: Check Supabase configuration

## Integration Points
- **Admin Page**: Debug admin page loading issues
- **AuthContext**: Test authentication flow
- **Database**: Verify table access and permissions
- **Error Handling**: Provide detailed error information 