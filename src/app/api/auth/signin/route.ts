import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await signIn({ email, password });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: result.error.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        name: result.user?.user_metadata?.name
      }
    });

  } catch (error) {
    console.error('Signin API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 