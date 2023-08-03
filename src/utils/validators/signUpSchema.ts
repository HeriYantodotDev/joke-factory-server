import Joi from 'joi';
import { Locales } from '../Enum';
//TODO: Add More validation error Message
export const signUpSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': Locales.errorUsernameEmpty,
      'string.base': Locales.errorUsernameNull,
      'string.min' : Locales.userSizeMin,
      'string.max' : Locales.userSizeMax,
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': Locales.errorEmailEmpty,
      'string.base': Locales.errorEmailNull,
      'string.email': Locales.errorEmailInvalid,
    }),
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
