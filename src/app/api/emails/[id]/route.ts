import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const email = await prisma.email.findFirst({
      where: {
        id: params.id,
        fromEmail: user.email,
      },
    });

    if (!email) {
      return NextResponse.json(
        createErrorResponse('Email not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(email));
  } catch (error) {
    console.error('Get email error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const email = await prisma.email.deleteMany({
      where: {
        id: params.id,
        fromEmail: user.email,
      },
    });

    if (email.count === 0) {
      return NextResponse.json(
        createErrorResponse('Email not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse({}, 'Email deleted successfully')
    );
  } catch (error) {
    console.error('Delete email error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
} 