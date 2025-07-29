# 🔧 Troubleshooting Guide

## 🚨 Problem: Pages are not loading (admin, projects)



### 🔍 Problem Diagnosis:

1. **AuthContext infinite loading** - AuthContext is spinning indefinitely
2. **Database connection issues** - Supabase is not configured
3. **Missing environment variables** - Missing .env files
4. **Projects page shows "Failed to fetch projects"** - Database query issues

### ✅ Solutions:

#### **1. Create .env file**

Create `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://qcphqciezuptvzezabam.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcGhxY2llenVwdHZ6ZXphYmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDEzMDIsImV4cCI6MjA2ODQxNzMwMn0.H4UwITwCcx2wX1TPkWZWTLp7hawexOwS6gFbawTsgMA

# Development Configuration
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
VITE_ENABLE_MOCK_DATA=true
```

#### **2. Restart the application**

```bash
# Stop current processes (Ctrl+C)
# Then restart:

npm run dev
```

#### **3. Test with Home page**

Go to: `http://localhost:5173/home`

This page will show you if the application is working normally.

#### **4. Check Console**

Open Developer Tools (F12) and check:
- Network tab - whether API calls are executing
- Console tab - whether there are errors
- Application tab - whether cookies/session are set

### 🔧 Additional Checks:

#### **1. Supabase Connection**

```javascript
// In browser console:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')
```

#### **2. Auth Status**

```javascript
// In browser console:
import { supabase } from './src/lib/supabase'
supabase.auth.getSession().then(console.log)
```

#### **3. Database Tables**

Check if the required tables exist in Supabase:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'projects', 'role_catalog', 'audit_logs', 'permissions', 'role_permissions');

-- If tables are missing, run database-setup.sql in Supabase SQL Editor
```

#### **4. User Profile Issue**

If you see "Timeout reached, setting loading to false", it means the user exists in `auth.users` but not in `public.users`:

```sql
-- Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE id = '7c11badb-a18a-4187-b3ce-7937f786cb91';

-- Check if user exists in public.users
SELECT * FROM public.users WHERE id = '7c11badb-a18a-4187-b3ce-7937f786cb91';

-- If it doesn't exist in public.users, create it:
INSERT INTO public.users (
  id, email, first_name, last_name, role, is_active, created_at, updated_at
) VALUES (
  '7c11badb-a18a-4187-b3ce-7937f786cb91',
  'your-email@example.com',
  'Your',
  'Name',
  'user',
  true,
  NOW(),
  NOW()
);
```

### 🚀 Quick Fixes:

#### **1. Fix User Profile (IMMEDIATE FIX)**

If you see "Timeout reached", execute this SQL command in Supabase SQL Editor:

```sql
-- Create user profile for current user
INSERT INTO public.users (
  id, email, first_name, last_name, role, is_active, created_at, updated_at
) VALUES (
  '7c11badb-a18a-4187-b3ce-7937f786cb91', -- Replace with your user ID
  'your-email@example.com', -- Replace with your email
  'Your',
  'Name',
  'user',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();
```

#### **2. Reset AuthContext**

```javascript
// U browser console:
localStorage.clear()
sessionStorage.clear()
window.location.reload()
```

#### **3. Force Login**

Idi na: `http://localhost:5173/auth`

#### **3. Bypass Auth (temporary)**

If you need to test quickly, you can temporarily remove ProtectedRoute:

```typescript
// In src/App.tsx, temporarily replace:
<ProtectedRoute>
  <Layout>
    <Admin />
  </Layout>
</ProtectedRoute>

// With:
<Layout>
  <Admin />
</Layout>
```

### 📋 Checklist:

- [ ] `.env` fajl kreiran
- [ ] Aplikacija pokrenuta ponovo
- [ ] Home stranica radi (`/home`)
- [ ] Console nema grešaka
- [ ] Supabase connection radi
- [ ] Auth status je OK

### 🆘 If it still doesn't work:

1. **Check Supabase project** - whether it's active
2. **Check RLS policies** - whether they're set correctly
3. **Check database schema** - whether all tables are created
4. **Check network** - whether you can access Supabase URL

### 📞 Support:

If you still have problems:
1. Check console errors
2. Take a screenshot
3. Copy error messages
4. Describe what's happening

---

## 🚨 Problem: "Failed to fetch projects" error

### 🔍 Problem Diagnosis:

When you visit `/projects` page and see "Failed to fetch projects" error, it usually means:

1. **Database query issues** - Wrong column names or table structure
2. **RLS policies** - User doesn't have permission to access projects
3. **No projects exist** - User has no projects in database
4. **User profile missing** - User exists in auth but not in public.users

### ✅ Solutions:

#### **1. Check Database Schema**

Make sure you've run the complete `database-setup.sql` in Supabase SQL Editor.

#### **2. Create Test Projects**

Run this SQL script in Supabase SQL Editor to create test projects:

```sql
-- create-test-projects.sql
-- This will create test projects for the current user
```

#### **3. Check User Permissions**

Verify that the user exists in `public.users` table:

```sql
-- Check if user exists
SELECT * FROM public.users WHERE id = auth.uid();

-- If not exists, create user profile
INSERT INTO public.users (id, email, first_name, last_name, role, is_active)
VALUES (auth.uid(), 'your-email@example.com', 'Your', 'Name', 'user', true)
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
```

#### **4. Check RLS Policies**

Verify that RLS policies are set correctly:

```sql
-- Check projects policies
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Check if user can access projects
SELECT * FROM public.projects WHERE owner_id = auth.uid();
```

### 🔧 Debug Steps:

1. **Open browser console** (F12)
2. **Go to Projects page** (`/projects`)
3. **Check console logs** for detailed error messages
4. **Look for**:
   - User ID being used
   - Database query results
   - RLS policy errors

### 📋 Projects Page Checklist:

- [ ] User exists in `public.users` table
- [ ] RLS policies are enabled and correct
- [ ] Database schema is up to date
- [ ] Console shows no errors
- [ ] Projects are being fetched successfully

---

## 🎯 Expected Result:

After these steps, you should be able to access:
- ✅ `http://localhost:5173/home` - Home page  
- ✅ `http://localhost:5173/projects` - Projects page
- ✅ `http://localhost:5173/admin` - Admin page (if you have admin role)
- ✅ `http://localhost:5173/profile` - Profile page
- ✅ `http://localhost:5173/twilio` - Twilio SMS
- ✅ `http://localhost:5173/email` - SendGrid Email 