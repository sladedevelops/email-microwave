import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(userProfile));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          createErrorResponse('Email already in use'),
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      createSuccessResponse(updatedUser, 'User updated successfully')
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
} 