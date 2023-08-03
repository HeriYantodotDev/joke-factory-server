import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ErrorHandle, ErrorEntityTooLarge } from '../Errors';

export interface ErrorMessageInvalidJSON {
  error: 'Invalid JSON',
  message: string,
}

export function checkingJSONRequest(): ErrorRequestHandler {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction) {

    if (!err) {
      next();
      return;
    }
    
    if (err instanceof SyntaxError) {
      const errorResponse: ErrorMessageInvalidJSON = {
        error: 'Invalid JSON',
        message: err.message,
      };

      res.status(400).send(errorResponse);
      return;
    } 

    
    if ( err.status === 413) {
      ErrorHandle(new ErrorEntityTooLarge(err.message), req, res, next);
      return;
    }

  };
}