import Joi from 'joi';
import { Locales } from '../Enum';

export const passwordUpdateSchema = Joi.object({
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
  passwordResetToken: Joi.string()
    .required(),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});