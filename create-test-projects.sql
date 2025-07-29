-- =====================================================
-- CREATE TEST PROJECTS FOR CURRENT USER
-- =====================================================
-- Run this script in Supabase SQL Editor to create test projects
-- Make sure you're logged in as the user who should own these projects

-- First, get the current user's ID
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current authenticated user's ID
    current_user_id := auth.uid();
    
    -- Check if user exists in public.users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = current_user_id) THEN
        RAISE EXCEPTION 'User not found in public.users table. Please make sure you are logged in and the user profile exists.';
    END IF;
    
    -- Insert test projects
    INSERT INTO public.projects (name, description, owner_id, total_cost, currency, duration_months, monthly_hours) VALUES
    ('E-commerce Website', 'Development of a new online retail platform with payment processing and inventory management', current_user_id, 25000.00, 'USD', 3, 160),
    ('Mobile App Development', 'Cross-platform mobile application for iOS and Android with real-time features', current_user_id, 35000.00, 'USD', 4, 160),
    ('Corporate Website Redesign', 'Modern redesign of company website with improved UX and SEO optimization', current_user_id, 15000.00, 'USD', 2, 160),
    ('API Development', 'RESTful API development with documentation and testing suite', current_user_id, 18000.00, 'USD', 2, 160),
    ('Database Migration', 'Legacy database migration to modern cloud infrastructure', current_user_id, 12000.00, 'USD', 1, 160)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test projects created successfully for user: %', current_user_id;
END $$;

-- Verify the projects were created
SELECT 
    p.name,
    p.description,
    p.total_cost,
    p.currency,
    p.duration_months,
    p.created_at
FROM public.projects p
WHERE p.owner_id = auth.uid()
ORDER BY p.created_at DESC; 