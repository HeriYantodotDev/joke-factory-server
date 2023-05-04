import { RequestHandler, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Validator } from '../validators/Validator';
import { ErrorResponse } from '../../models';
import { ErrorHandle, ErrorBodyValidation } from '../Errors';

export interface ValidationResGenerator{
  (validator: Validator, req: Request): ErrorResponse | undefined,
}

export function bodyValidatorMW(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Joi.ObjectSchema<any>, 
  resGenerator: ValidationResGenerator,
  options?: Joi.ValidationOptions
): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction): void {
    const validator = new Validator(schema);
    
    if (options) {
      validator.validate(req.body, options);
    } else {
      validator.validate(req.body);
    }

    const validationError = resGenerator(validator, req);

    if (validationError) {
      const {message, validationErrors} = validationError;
      ErrorHandle(new ErrorBodyValidation(message, validationErrors), req, res, next);
      return;
    }

    next();
  };
}
