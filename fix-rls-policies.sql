-- Fix RLS Policies for User Profiles
-- This script ensures the RLS policies allow profile creation

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create new policies that work correctly
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Also create a policy for service role (server-side operations)
CREATE POLICY "Service role can manage profiles" ON public.user_profiles
    FOR ALL USING (true);

-- Verify the policies
SELECT 
    'RLS policies fixed!' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'user_profiles' AND schemaname = 'public'; 