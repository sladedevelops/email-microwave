import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Invalid credentials'),
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        createErrorResponse('Invalid credentials'),
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      createSuccessResponse(
        { user: userResponse, token },
        'Login successful'
      )
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0].message),
        { status: 400 }
      );
    }
    
    // Handle Prisma connection errors
    if (error instanceof Error && error.message.includes('prisma')) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        createErrorResponse('Database connection error'),
        { status: 500 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
} 