# 03 - Admin System

## Admin Dashboard Overview
Create a comprehensive admin system for managing users, roles, and system settings.

## User Management
- View all users in the system
- Add new users
- Edit user information (name, email, role)
- Deactivate/reactivate users
- Change user roles (user, role_admin, global_admin)
- Search and filter users
- Bulk operations (delete, role changes)

## Role Catalog Management
- View all roles in the system
- Add new roles with:
  - Role name and description
  - Base hourly rate
  - Currency
  - Category (Development, Design, Management, etc.)
  - Skills and requirements
  - Experience level (Junior, Mid, Senior, Expert)
- Edit existing roles
- Delete roles (with confirmation)
- Search and filter roles

## Permission System
- Role-based access control (RBAC)
- Permission matrix for different actions:
  - View users
  - Create users
  - Edit users
  - Delete users
  - View roles
  - Create roles
  - Edit roles
  - Delete roles
  - View audit logs
  - Manage permissions
- Assign permissions to roles
- User permission inheritance

## Audit Trail
- Track all user actions
- Log important system events
- View audit history
- Filter audit logs by:
  - User
  - Action type
  - Date range
  - Table/entity affected
- Export audit logs

## Admin Roles
### Global Admin
- Full system access
- User management
- Role management
- Permission management
- Audit log access
- System settings

### Role Admin
- Role catalog management
- View users (read-only)
- Limited audit access

### Regular User
- No admin access
- Can view role catalog
- Can use calculator features

## Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Role catalog table
CREATE TABLE role_catalog (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  skills TEXT[],
  experience_level TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL
);

-- Role permissions table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id UUID REFERENCES permissions(id),
  granted BOOLEAN DEFAULT TRUE
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## UI Components
- Admin dashboard with tabs
- User management table with actions
- Role catalog management
- Permission matrix interface
- Audit log viewer
- Search and filter components
- Modal dialogs for add/edit operations

## Security Features
- Row Level Security (RLS) policies
- Input validation and sanitization
- CSRF protection
- Rate limiting
- Session management 


Create admin panel:
- User management: view/edit users, assign roles
- Role catalog management: predefined roles, hourly rates, active/inactive
- Permission matrix and audit trail
- Access control: global_admin → full access, role_admin → role catalog only

ChatGPT Prompt suggestion:
Create admin panel:
- User management: view/edit users, assign roles
- Role catalog management: predefined roles, hourly rates, active/inactive
- Permission matrix and audit trail
- Access control: global_admin → full access, role_admin → role catalog only
