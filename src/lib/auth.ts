import { createClientSupabaseClient } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

// Sign up with email and password
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  try {
    const supabase = createClientSupabaseClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, status: 400 }
      };
    }

    // If signup successful, create user record in our users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email!,
            name: name,
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the signup if profile creation fails
      }
    }

    return {
      user: data.user,
      error: null
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      error: { message: 'An unexpected error occurred', status: 500 }
    };
  }
}

// Sign in with email and password
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    const supabase = createClientSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, status: 400 }
      };
    }

    return {
      user: data.user,
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      error: { message: 'An unexpected error occurred', status: 500 }
    };
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const supabase = createClientSupabaseClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: { message: error.message, status: 400 }
      };
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      error: { message: 'An unexpected error occurred', status: 500 }
    };
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClientSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const supabase = createClientSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Get current session error:', error);
    return null;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClientSupabaseClient();
  
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
} 