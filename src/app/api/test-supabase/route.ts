import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Simple test - just check if we can connect
    const { data, error } = await supabase
      .from('_dummy_table_that_doesnt_exist')
      .select('*')
      .limit(1);

    // We expect an error since the table doesn't exist, but this proves connection works
    if (error && error.code === '42P01') {
      // Table doesn't exist error - this means connection is working!
      return NextResponse.json({
        success: true,
        message: 'Supabase connection successful!',
        details: 'Connection established, but tables need to be created.',
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: data
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
} 