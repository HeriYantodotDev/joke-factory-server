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

export class ErrorSendEmail extends Error {
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

export class ErrorUserNotFound extends Error {
  public code = 404;
  constructor(message = Locales.userNotFound) {
    super(message);
  }
}

export class ErrorAuthFailed extends Error {
  public code = 401;
  constructor(message = Locales.authFailure) {
    super(message);
  }
}

export class ErrorAuthForbidden extends Error {
  public code = 403;
  //the default is for inactive account
  constructor(message = Locales.inactiveAccount) {
    super(message);
  }
}

export class ErrorEmailNotInuse extends Error {
  public code = 404;
  constructor(message = Locales.emailNotInuse) {
    super(message);
  }
}

