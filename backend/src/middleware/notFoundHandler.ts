import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(new CustomError(`Not found - ${req.originalUrl}`, 404));
};
