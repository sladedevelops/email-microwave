// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email types
export interface Email {
  id: string;
  subject: string;
  content: string;
  fromEmail: string;
  toEmail: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse extends ApiResponse<{
  user: User;
  token: string;
}> {}

// Common utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility functions
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(error && { error }),
  ...(message && { message }),
});

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> =>
  createApiResponse(true, data, undefined, message);

export const createErrorResponse = (error: string): ApiResponse =>
  createApiResponse(false, undefined, error); 