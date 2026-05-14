import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: any;
  errors?: any;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err: any): CustomError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): CustomError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
};

const handleValidationErrorDB = (err: any): CustomError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new CustomError(message, 400);
};

const handleJWTError = (): CustomError =>
  new CustomError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): CustomError =>
  new CustomError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: AppError, res: Response): void => {
  // A) API
  if (res.req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // B) RENDERED WEBSITE
    logger.error('ERROR 💥', err);
    res.status(err.statusCode || 500).json({
      title: 'Something went wrong!',
      msg: err.message
    });
  }
};

const sendErrorProd = (err: AppError, res: Response): void => {
  // A) API
  if (res.req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message
      });
    } else {
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
      logger.error('ERROR 💥', err);

      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  } else {
    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        title: 'Something went wrong!',
        msg: err.message
      });
    } else {
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
      logger.error('ERROR 💥', err);

      // 2) Send generic message
      res.status(err.statusCode || 500).json({
        title: 'Something went wrong!',
        msg: 'Please try again later.'
      });
    }
  }
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const AppError = CustomError;
