import Joi from 'joi';
import { Locales } from '../Enum';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': Locales.errorEmailEmpty,
      'string.base': Locales.errorEmailNull,
      'string.email': Locales.errorEmailInvalid,
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.base': Locales.errorPasswordNull,
      'string.empty': Locales.errorPasswordEmpty,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});