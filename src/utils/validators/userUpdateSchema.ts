import Joi,  { CustomHelpers } from 'joi';
import { Locales } from '../Enum';

function validateImageSize(value: string, helpers: CustomHelpers) {
  if (!value) {
    return value;
  }

  const buffer = Buffer.from(value, 'base64');

  if (buffer.length > 2 * 1024 * 1024) {
    return helpers.error('imageSize.max');
  } 
  return value;
}

function validateImageType(value: string, helpers: CustomHelpers) {
  const whiteListingImageHeaders = {
    'image/jpeg' : '/9j/',
    'image/png': 'iVBORw0K',
  };

  if (!value) {
    return value;
  }

  const header = value.substring(0,30);

  const isValidType = Object.values(whiteListingImageHeaders).some(pattern => header.startsWith(pattern));

  if(isValidType) {
    return value;
  }

  return helpers.error('imageType.invalid');
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
    .custom(validateImageSize)
    .custom(validateImageType)
    .messages({
      'imageSize.max': Locales.profileImageSize, 
      'imageType.invalid': Locales.unsupportedImageFile, 
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});
