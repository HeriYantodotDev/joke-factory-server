import Joi,  { CustomHelpers } from 'joi';
import { Locales } from '../Enum';

function validateImage(value: string, helpers: CustomHelpers) {

  if (!value) {
    return value;
  }

  const buffer = Buffer.from(value, 'base64');

  if (buffer.length > 2 * 1024 * 1024) {
    return helpers.error('any.invalid');
  } 
  return value;
}

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
  image: Joi.any()
    .optional()
    .custom(validateImage)
    .messages({
      'any.invalid': Locales.profileImageSize, 
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});
