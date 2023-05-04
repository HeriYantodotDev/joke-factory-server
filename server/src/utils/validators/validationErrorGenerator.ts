import { Validator } from './Validator';
import { ErrorResponse, ValidationErrorResponse} from '../../models';
import { Request } from 'express';

export function validationErrorGenerator(
  validator: Validator,
  req: Request
): ErrorResponse | undefined {
  const validationErrors: Record<string, string> = {};

  let responseError: ErrorResponse | undefined = undefined;

  if ( validator.error && validator.errorMessage ) {
    validator.error.details.forEach((errorDetail) => {
      const fieldName = errorDetail.context?.key || '';
      const errorMessage = req.t(errorDetail.message);
      //a field might have a lot of errors. we only want to capture the first error 
      if (!validationErrors[fieldName]) {
        validationErrors[fieldName] = errorMessage;
      }
    });
    // This is just additional typecheck. 
    const validationErrorsTypeCheck: ValidationErrorResponse['validationErrors'] = validationErrors;

    responseError = {
      message: req.t(validator.errorMessage),
      validationErrors: validationErrorsTypeCheck,
    };
  }
  
  return responseError;
} 