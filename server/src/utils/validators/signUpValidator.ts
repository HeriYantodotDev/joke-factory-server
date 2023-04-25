import Joi from 'joi';
import { Validator } from './Validator';
import { ErrorResponse, ValidationErrorResponse} from '../../models';
import { Request } from 'express';
import { Locales } from '../Enum';
//TODO: Add More validation error Message
export const signUpSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': Locales.errorUsernameEmpty,
      'string.base': Locales.errorUsernameNull,
      'string.min' : Locales.userSizeMin,
      'string.max' : Locales.userSizeMax,
    })
    ,
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': Locales.errorEmailEmpty,
      'string.base': Locales.errorEmailNull,
      'string.email': Locales.errorEmailInvalid,
    })
    ,
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .required()
    .messages({
      'string.base': Locales.errorPasswordNull,
      'string.pattern.base': Locales.errorPassword1,
      'string.empty': Locales.errorPasswordEmpty,
      'string.min': Locales.errorPassword2,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});

export function signUpValidationErrorGenerator(
  signUpValidator: Validator,
  req: Request
): ErrorResponse | undefined {
  const validationErrors: Record<string, string> = {};

  let responseError: ErrorResponse | undefined = undefined;

  if ( signUpValidator.error && signUpValidator.errorMessage ) {
    signUpValidator.error.details.forEach((errorDetail) => {
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
      message: req.t(signUpValidator.errorMessage),
      validationErrors: validationErrorsTypeCheck,
    };
  }
  return responseError;
} 
