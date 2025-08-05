import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '@email-microwave/shared';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Database operation failed';
    error = { message, statusCode: 400 } as AppError;
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 } as AppError;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = { message, statusCode: 400 } as AppError;
  }

  // Cast errors (MongoDB)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 } as AppError;
  }

  // Duplicate key errors
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 } as AppError;
  }

  res.status(error.statusCode || 500).json(
    createErrorResponse(error.message || 'Server Error')
  );
}; 