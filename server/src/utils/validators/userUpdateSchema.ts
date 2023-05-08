import Joi from 'joi';
import { Locales } from '../Enum';

export const userUpdateSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': Locales.errorUsernameEmpty,
      'string.empty': Locales.errorUsernameEmpty,
      'string.base': Locales.errorUsernameNull,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});
