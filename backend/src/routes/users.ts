import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createSuccessResponse, createErrorResponse } from '@email-microwave/shared';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    res.json(createSuccessResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

// @desc    Update user
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, async (req: AuthRequest, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is being updated and if it's already taken
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json(createErrorResponse('Email already in use'));
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
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

    res.json(createSuccessResponse(updatedUser, 'User updated successfully'));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(createErrorResponse('Server error'));
  }
});

export default router; 