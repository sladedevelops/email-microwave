# Supabase Setup Guide

This project includes a configured Supabase client that works on both server and client side.

## Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## Usage

### Server-Side (API Routes)

```typescript
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

### Client-Side (React Components)

```typescript
'use client';

import { supabase, getCurrentUser } from '@/lib/supabase';

export default function MyComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    fetchUser();
  }, []);
  
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password',
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
  };
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}!</p>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

## Available Functions

### `supabase`
Default client for general use. Handles auth state and session persistence.

### `createServerSupabaseClient()`
Server-side client optimized for API routes. Doesn't persist sessions.

### `createClientSupabaseClient()`
Client-side client for React components. Handles auth state and session persistence.

### `getCurrentUser()`
Helper function to get the current authenticated user.

### `getCurrentSession()`
Helper function to get the current session.

## TypeScript Support

The Supabase client includes full TypeScript support with database schema types defined in `src/types/supabase.ts`.

## Database Schema

The current schema includes:

- **users** table: id, email, name, created_at, updated_at
- **emails** table: id, subject, content, from_email, to_email, status, sent_at, created_at, updated_at

## Authentication

The Supabase client is configured with:
- Auto token refresh
- Session persistence
- URL session detection

## Error Handling

All functions include proper error handling and will log errors to the console in development. 