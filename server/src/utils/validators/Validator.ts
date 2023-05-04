import Joi from 'joi';
import { NewUser } from '../../models';
import { signUpSchema } from './signUpSchema';
import { Locales } from '../Enum';
import { loginSchema } from './loginSchema';

export class Validator {
  private schema: Joi.ObjectSchema;
  private errorResult: Joi.ValidationError | undefined;
  private errorMessageResult: string | undefined;
  private validationResult: Joi.ValidationResult | undefined;

  constructor(schema: Joi.ObjectSchema) {
    this.schema = schema;
  }

  public validate(data: NewUser, options?:Joi.ValidationOptions): void {
    if (options) {
      this.validationResult = this.schema.validate(data, options);
    } else {
      this.validationResult = this.schema.validate(data);
    }

    if (this.validationResult) {
      this.errorResult = this.validationResult.error;

      if (
        JSON.stringify(this.schema) === JSON.stringify(signUpSchema) || 
        JSON.stringify(this.schema) === JSON.stringify(loginSchema)
      ) {
        this.errorMessageResult = Locales.validationFailure;
      } else {
        this.errorMessageResult = this.errorResult?.details[0].message;
      }
    }
  }

  public get result(): Joi.ValidationResult | undefined {
    return this.validationResult;
  }

  public get error(): Joi.ValidationError | undefined {
    return this.errorResult;
  }

  public get errorMessage(): string | undefined {
    return this.errorMessageResult;
  }
}
