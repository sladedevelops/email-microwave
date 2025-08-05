-- Email Microwave Database Complete Reset
-- This script will completely reset and recreate the database structure

-- Step 1: Disable RLS temporarily
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop everything that might exist
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_emails_updated_at ON public.emails;

-- Step 4: Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 5: Drop all policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can insert their own emails" ON public.emails;

-- Step 6: Drop all indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP INDEX IF EXISTS idx_user_profiles_onboarding;
DROP INDEX IF EXISTS idx_emails_status;
DROP INDEX IF EXISTS idx_emails_created_at;
DROP INDEX IF EXISTS idx_emails_user_id;

-- Step 7: Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create user_profiles table (references auth.users)
CREATE TABLE public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    major VARCHAR(255) NOT NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Step 9: Create emails table (references auth.users)
CREATE TABLE public.emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: Create indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_onboarding ON public.user_profiles(onboarding_completed);
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_emails_status ON public.emails(status);
CREATE INDEX idx_emails_created_at ON public.emails(created_at);

-- Step 11: Create triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at 
    BEFORE UPDATE ON public.emails 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Step 13: Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Step 14: Create policies for emails
CREATE POLICY "Users can view their own emails" ON public.emails
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own emails" ON public.emails
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own emails" ON public.emails
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Step 15: Verify the setup
SELECT 
    'Database reset completed successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') as user_profiles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'emails' AND table_schema = 'public') as emails_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') as old_users_exists; 