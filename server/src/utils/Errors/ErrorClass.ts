import { ValidationErrorResponse } from '../../models';
import { Locales } from '../Enum';

export class ErrorBodyValidation extends Error {
  public code = 400;
  public validationErrors: ValidationErrorResponse['validationErrors'];
  constructor(message: string, validationErrors: ValidationErrorResponse['validationErrors']){
    super(message);
    this.validationErrors = validationErrors;
  }
}

export class ErrorSendEmailActivation extends Error {
  public code = 502;
  constructor(message = Locales.emailFailure) {
    super(message);
  }
}

export class ErrorUserExists extends Error {
  public field: string;
  public code = 400;
  constructor(field: string, message = Locales.errorUserExist) {
    super(message);
    this.field = field;
  }
}

export class ErrorToken extends Error {
  public code = 400;
  constructor(message = 'tokenError') {
    super(message);
  }
}
