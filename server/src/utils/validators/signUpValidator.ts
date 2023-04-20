import Joi from 'joi';
import { Validator } from './Validator';
import { ResponseUserCreatedFailed, SIGNUP_STATUS } from '../../models';
import { Request } from 'express';
//TODO: Add More validation error Message
export const signUpSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'errorUsernameEmpty',
      'string.base': 'errorUsernameNull',
      'string.min' : 'userSizeMin',
      'string.max' : 'userSizeMax',
    })
    ,
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'errorEmailEmpty',
      'string.base': 'errorEmailNull',
      'string.email': 'errorEmailInvalid',
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
      'string.base': 'errorPasswordNull',
      'string.pattern.base': 'errorPassword1',
      'string.empty': 'errorPasswordEmpty',
      'string.min': 'errorPassword2',
    }),
});

export function signUpValidationErrorGenerator(
  signUpValidator: Validator,
  req: Request
): object | undefined {
  const validationErrors: Record<string, string> = {};

  let responseError: ResponseUserCreatedFailed | undefined = undefined;

  if ( signUpValidator.error && signUpValidator.errorMessage ) {
    signUpValidator.error.details.forEach((errorDetail) => {
      const fieldName = errorDetail.context?.key || '';
      const errorMessage = req.t(errorDetail.message);
      //a field might have a lot of errors. we only want to capture the first error 
      if (!validationErrors[fieldName]) {
        validationErrors[fieldName] = errorMessage;
      }
    });

    responseError = {
      signUpStatus: SIGNUP_STATUS.failed,
      message: req.t(signUpValidator.errorMessage),
      validationErrors,
    };
  }
  return responseError;
} 
