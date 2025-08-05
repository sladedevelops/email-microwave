'use client';

import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];

export default function SupabaseExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    // Fetch users from Supabase
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(10);

        if (error) {
          console.error('Error fetching users:', error);
        } else {
          setUsers(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'example@email.com',
        password: 'password',
      });

      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Signed in successfully');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Signed out successfully');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Supabase Example</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current User</h3>
        {currentUser ? (
          <div>
            <p>Email: {currentUser.email}</p>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p>Not signed in</p>
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Users</h3>
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id} className="mb-2">
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
} 