-- =====================================================
-- PROJECT COST CALCULATOR - COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains everything needed to set up the database
-- Run this in Supabase SQL Editor to set up the complete database

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'role_admin', 'global_admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    total_cost DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    duration_months INTEGER DEFAULT 1,
    monthly_hours INTEGER DEFAULT 160,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project shares table
CREATE TABLE IF NOT EXISTS public.project_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Project templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    created_by UUID REFERENCES public.users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role catalog table
CREATE TABLE IF NOT EXISTS public.role_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project roles table
CREATE TABLE IF NOT EXISTS public.project_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    role_catalog_id UUID REFERENCES public.role_catalog(id),
    title TEXT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    hours INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_project ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_user ON public.project_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_project_roles_project ON public.project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_role_catalog_category ON public.role_catalog(category);
CREATE INDEX IF NOT EXISTS idx_role_catalog_active ON public.role_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- =====================================================
-- 3. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        'user',
        true,
        NEW.created_at,
        NEW.updated_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate project total cost
CREATE OR REPLACE FUNCTION public.calculate_project_cost(project_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(hourly_rate * hours), 0)
    INTO total
    FROM public.project_roles
    WHERE project_id = project_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Update updated_at on table changes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON public.project_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_catalog_updated_at BEFORE UPDATE ON public.role_catalog
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_roles_updated_at BEFORE UPDATE ON public.project_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user profile when new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update project total cost when roles change
CREATE OR REPLACE FUNCTION public.update_project_total_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects
    SET total_cost = public.calculate_project_cost(COALESCE(NEW.project_id, OLD.project_id))
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_cost_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON public.project_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_project_total_cost();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.project_shares 
            WHERE project_id = id AND user_id = auth.uid()
        )
    );

-- Project shares policies
CREATE POLICY "Users can view project shares" ON public.project_shares
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage shares" ON public.project_shares
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Role catalog policies
CREATE POLICY "Anyone can view active roles" ON public.role_catalog
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage roles" ON public.role_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

-- Project roles policies
CREATE POLICY "Users can view project roles" ON public.project_roles
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
            UNION
            SELECT project_id FROM public.project_shares WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage roles" ON public.project_roles
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

-- Permissions policies
CREATE POLICY "Anyone can view permissions" ON public.permissions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

-- Role permissions policies
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('global_admin', 'role_admin')
        )
    );

-- =====================================================
-- 8. INSERT SEED DATA
-- =====================================================

-- Insert permissions
INSERT INTO public.permissions (name, description) VALUES
('users:read', 'Can view users'),
('users:write', 'Can create and update users'),
('projects:read', 'Can view projects'),
('projects:write', 'Can create and update projects'),
('roles:read', 'Can view roles'),
('roles:write', 'Can create and update roles'),
('admin:audit', 'Can view audit logs'),
('admin:all', 'Full admin access')
ON CONFLICT DO NOTHING;

-- Insert role permissions
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'user', id FROM public.permissions WHERE name IN ('projects:read', 'projects:write')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'role_admin', id FROM public.permissions WHERE name IN ('users:read', 'users:write', 'projects:read', 'projects:write', 'roles:read', 'roles:write', 'admin:audit')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'global_admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Insert role catalog
INSERT INTO public.role_catalog (title, category, base_rate, currency, description) VALUES
-- Development
('Frontend Developer', 'Development', 75.00, 'USD', 'React, Vue, Angular development'),
('Backend Developer', 'Development', 85.00, 'USD', 'Node.js, Python, Java development'),
('Full Stack Developer', 'Development', 95.00, 'USD', 'Full stack development'),
('Mobile Developer', 'Development', 80.00, 'USD', 'iOS, Android development'),
('DevOps Engineer', 'Development', 90.00, 'USD', 'Infrastructure and deployment'),
('Database Developer', 'Development', 85.00, 'USD', 'Database design and optimization'),

-- Design
('UI/UX Designer', 'Design', 70.00, 'USD', 'User interface and experience design'),
('Graphic Designer', 'Design', 60.00, 'USD', 'Visual design and branding'),
('Product Designer', 'Design', 80.00, 'USD', 'Product design and strategy'),
('Web Designer', 'Design', 65.00, 'USD', 'Web design and frontend'),

-- Management
('Project Manager', 'Management', 100.00, 'USD', 'Project planning and coordination'),
('Product Manager', 'Management', 110.00, 'USD', 'Product strategy and roadmap'),
('Scrum Master', 'Management', 85.00, 'USD', 'Agile process facilitation'),
('Technical Lead', 'Management', 120.00, 'USD', 'Technical leadership and architecture'),

-- Operations
('DevOps Engineer', 'Operations', 90.00, 'USD', 'Infrastructure and automation'),
('System Administrator', 'Operations', 75.00, 'USD', 'System administration and maintenance'),

-- Quality Assurance
('QA Engineer', 'Quality Assurance', 70.00, 'USD', 'Testing and quality assurance'),

-- Analytics
('Data Analyst', 'Analytics', 75.00, 'USD', 'Data analysis and reporting'),
('Data Scientist', 'Analytics', 95.00, 'USD', 'Advanced data analysis and ML'),

-- Security
('Security Engineer', 'Security', 100.00, 'USD', 'Security implementation and testing'),

-- Marketing
('Content Strategist', 'Marketing', 65.00, 'USD', 'Content strategy and creation'),
('Marketing Manager', 'Marketing', 85.00, 'USD', 'Marketing strategy and execution')
ON CONFLICT DO NOTHING;

-- Insert test projects (these will be created for any user who signs up)
-- Note: These projects will be created dynamically when users sign up
-- For manual testing, you can insert projects directly in Supabase SQL Editor:

/*
-- Example: Insert test project for a specific user (replace USER_ID with actual user ID)
INSERT INTO public.projects (name, description, owner_id, total_cost, currency, duration_months, monthly_hours) VALUES
('E-commerce Website', 'Development of a new online retail platform', 'USER_ID_HERE', 25000.00, 'USD', 3, 160),
('Mobile App Development', 'Cross-platform mobile application for iOS and Android', 'USER_ID_HERE', 35000.00, 'USD', 4, 160),
('Corporate Website Redesign', 'Modern redesign of company website', 'USER_ID_HERE', 15000.00, 'USD', 2, 160)
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.projects TO anon, authenticated;
GRANT ALL ON public.project_shares TO anon, authenticated;
GRANT ALL ON public.project_templates TO anon, authenticated;
GRANT ALL ON public.role_catalog TO anon, authenticated;
GRANT ALL ON public.project_roles TO anon, authenticated;
GRANT ALL ON public.notifications TO anon, authenticated;
GRANT ALL ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.permissions TO anon, authenticated;
GRANT ALL ON public.role_permissions TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check if everything was created successfully
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'Role catalog entries:' as info;
SELECT COUNT(*) as role_count FROM public.role_catalog WHERE is_active = true;

SELECT 'Permissions created:' as info;
SELECT COUNT(*) as permission_count FROM public.permissions;

SELECT 'Role permissions assigned:' as info;
SELECT COUNT(*) as role_permission_count FROM public.role_permissions;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for the Project Cost Calculator application.
-- 
-- Next steps:
-- 1. Create users through the application or Supabase Auth
-- 2. Test the application functionality
-- 3. Check that all features work correctly
--
-- For troubleshooting, see TROUBLESHOOTING-GUIDE.md 