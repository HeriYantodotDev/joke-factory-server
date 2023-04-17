import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export interface ErrorMessageInvalidJSON {
  error: 'Invalid JSON',
  message: string,
}

export function checkingJSONRequest(): ErrorRequestHandler {
  return function (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction) {
    if (err instanceof SyntaxError) {
      const errorResponse: ErrorMessageInvalidJSON = {
        error: 'Invalid JSON',
        message: err.message,
      };

      res.status(400).send(errorResponse);
      return;
    } else {
      next();
    }
  };
}