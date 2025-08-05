import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/types';

const createEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  toEmail: z.string().email('Invalid recipient email'),
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, content, toEmail } = createEmailSchema.parse(body);

    const email = await prisma.email.create({
      data: {
        subject,
        content,
        fromEmail: user.email,
        toEmail,
      },
    });

    return NextResponse.json(
      createSuccessResponse(email, 'Email created successfully'),
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse(error.errors[0].message),
        { status: 400 }
      );
    }
    console.error('Create email error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json(
        createErrorResponse('Not authorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where: {
          fromEmail: user.email,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.email.count({
        where: {
          fromEmail: user.email,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      createSuccessResponse({
        emails,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error('Get emails error:', error);
    return NextResponse.json(
      createErrorResponse('Server error'),
      { status: 500 }
    );
  }
} 