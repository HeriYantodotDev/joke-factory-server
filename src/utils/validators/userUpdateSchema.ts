import Joi from 'joi';
import { Locales } from '../Enum';

export const userUpdateSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(30)
    .messages({
      'any.required': Locales.errorUsernameEmpty,
      'string.empty': Locales.errorUsernameEmpty,
      'string.base': Locales.errorUsernameNull,
      'string.min' : Locales.userSizeMin,
      'string.max' : Locales.userSizeMax,
    }),
  image: Joi.any().optional(),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});
