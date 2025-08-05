import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '@email-microwave/shared';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json(createErrorResponse(`Route ${req.originalUrl} not found`));
}; 