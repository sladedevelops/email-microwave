import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '@email-microwave/shared';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  toEmail: z.string().email('Invalid recipient email'),
});

// @desc    Create email
// @route   POST /api/emails
// @access  Private
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { subject, content, toEmail } = createEmailSchema.parse(req.body);

    const email = await prisma.email.create({
      data: {
        subject,
        content,
        fromEmail: req.user!.email,
        toEmail,
      },
    });

    res.status(201).json(
      createSuccessResponse(email, 'Email created successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(
        createErrorResponse(error.errors[0].message)
      );
    }
    console.error('Create email error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

// @desc    Get user's emails
// @route   GET /api/emails
// @access  Private
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where: {
          fromEmail: req.user!.email,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.email.count({
        where: {
          fromEmail: req.user!.email,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json(
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
    res.status(500).json(createErrorResponse('Server error'));
  }
});

// @desc    Get single email
// @route   GET /api/emails/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const email = await prisma.email.findFirst({
      where: {
        id: req.params.id,
        fromEmail: req.user!.email,
      },
    });

    if (!email) {
      return res.status(404).json(createErrorResponse('Email not found'));
    }

    res.json(createSuccessResponse(email));
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

// @desc    Update email status
// @route   PATCH /api/emails/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'SENT', 'FAILED'].includes(status)) {
      return res.status(400).json(createErrorResponse('Invalid status'));
    }

    const email = await prisma.email.updateMany({
      where: {
        id: req.params.id,
        fromEmail: req.user!.email,
      },
      data: {
        status,
        ...(status === 'SENT' && { sentAt: new Date() }),
      },
    });

    if (email.count === 0) {
      return res.status(404).json(createErrorResponse('Email not found'));
    }

    res.json(createSuccessResponse({}, 'Email status updated successfully'));
  } catch (error) {
    console.error('Update email status error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

// @desc    Delete email
// @route   DELETE /api/emails/:id
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const email = await prisma.email.deleteMany({
      where: {
        id: req.params.id,
        fromEmail: req.user!.email,
      },
    });

    if (email.count === 0) {
      return res.status(404).json(createErrorResponse('Email not found'));
    }

    res.json(createSuccessResponse({}, 'Email deleted successfully'));
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

export default router; 