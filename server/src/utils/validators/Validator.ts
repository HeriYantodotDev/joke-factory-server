import Joi from 'joi';

export class Validator {
  private schema: Joi.ObjectSchema;
  private errorResult: Joi.ValidationError | undefined;
  private errorMessageResult: string | undefined;
  private validationResult: Joi.ValidationResult | undefined;

  constructor(schema: Joi.ObjectSchema) {
    this.schema = schema;
  }

  public validate(data: {}): void {
    this.validationResult = this.schema.validate(data);
    this.errorResult = this.validationResult.error;
    this.errorMessageResult = this.errorResult?.details[0].message;
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
