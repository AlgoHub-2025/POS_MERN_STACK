import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: unknown;
  errors?: unknown;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: unknown;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

const toReadableErrors = (errors: unknown): string[] => {
  if (!errors || typeof errors !== 'object') return [];

  return Object.values(errors as Record<string, { message?: unknown }>).map((error) => (
    typeof error?.message === 'string' ? error.message : 'Invalid value'
  ));
};

const handleCastErrorDB = (err: AppError): CustomError => {
  const field = typeof err.path === 'string' ? err.path : 'id';
  return new CustomError(`Invalid ${field}`, 400);
};

const handleDuplicateFieldsDB = (): CustomError => {
  return new CustomError('Duplicate field value. Please use another value.', 400);
};

const handleValidationErrorDB = (err: AppError): CustomError => {
  const error = new CustomError('Validation failed', 400);
  error.errors = toReadableErrors(err.errors);
  return error;
};

const handleJWTError = (): CustomError => new CustomError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): CustomError => new CustomError('Your token has expired. Please log in again.', 401);

const normalizeError = (err: AppError): AppError => {
  if (err.name === 'CastError') return handleCastErrorDB(err);
  if (err.code === 11000) return handleDuplicateFieldsDB();
  if (err.name === 'ValidationError') return handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') return handleJWTError();
  if (err.name === 'TokenExpiredError') return handleJWTExpiredError();
  return err;
};

const sendSanitizedError = (err: AppError, res: Response): void => {
  const statusCode = err.statusCode || 500;

  if (!err.isOperational || statusCode >= 500) {
    logger.error('ERROR', err);
  }

  if (statusCode === 400 && err.message === 'Validation failed') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Array.isArray(err.errors) ? err.errors.map((error) => String(error)) : [],
    });
    return;
  }

  res.status(statusCode >= 500 ? 500 : statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : err.message,
  });
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  sendSanitizedError(normalizeError(err), res);
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const AppError = CustomError;
