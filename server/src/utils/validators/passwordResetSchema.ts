import Joi from 'joi';
import { Locales } from '../Enum';

export const passwordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': Locales.errorEmailEmpty,
      'string.base': Locales.errorEmailNull,
      'string.email': Locales.errorEmailInvalid,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});