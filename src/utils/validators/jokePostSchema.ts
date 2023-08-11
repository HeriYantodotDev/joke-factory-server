import Joi from 'joi';
import { Locales } from '../Enum';

export const jokePostSchema = Joi.object({
  content: Joi.string()
    .required()
    .min(10)
    .max(5000)
    .messages({
      'any.required': Locales.errorJokeContentEmpty,
      'string.empty': Locales.errorJokeContentEmpty,
      'string.base': Locales.errorJokeContentNull,
      'string.min' : Locales.jokeContentSize,
      'string.max' : Locales.jokeContentSize,
    }),
}).options({
    allowUnknown: false,
}).messages({
  'object.unknown': Locales.customFieldNotAllowed,
});
