import { Request, Response, NextFunction } from 'express';
import { 
  ErrorBodyValidation,
  ErrorSendEmailActivation,
  ErrorToken,
  ErrorUserExists, 
  ErrorUserNotFound,
  ErrorAuthFailed,
  ErrorAuthForbidden,
  ErrorEmailNotInuse
} from './ErrorClass';
import { ErrorResponse, ValidationErrorResponse } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorHandle(err: unknown, req: Request, res: Response, next: NextFunction ) {
  const path = req.originalUrl;
  
  if (err instanceof ErrorBodyValidation) {
    const validationErrors: ValidationErrorResponse['validationErrors'] = err.validationErrors;
    res.status(err.code).send(generateResponse(path, err.message, validationErrors));
    return;
  }

  if (err instanceof ErrorUserExists) {
    const field = err.field;
    const message = `${field}: ${req.body[field]} ${req.t(err.message)}`;
    const validationErrors: Record<string,string> = {};
    validationErrors[field] = message;

    res.status(err.code).send(generateResponse(path, message, validationErrors));
    return;
  }
  // To Do: Refactor this
  // Begin: handling ErrorGroup simple
  let isErrorGroupSimpleFound = false;
  const ErrorGroupSimple = [
    ErrorSendEmailActivation,
    ErrorToken,
    ErrorUserNotFound,
    ErrorAuthFailed,
    ErrorAuthForbidden,
    ErrorEmailNotInuse,
  ];
  ErrorGroupSimple.some((errorClass) => {
    if (err instanceof errorClass) {
      isErrorGroupSimpleFound = true;
      res.status(err.code).send(generateResponse(path, req.t(err.message)));
      return true;
    }
  });
  if(isErrorGroupSimpleFound) {
    return;
  }
   // end: handling ErrorGroup simple 

  if ( !(err instanceof Error)) {
    const message = 'Unknown Error';
    res.status(400).send(generateResponse(path, message));
    return;
  }

  res.status(400).send(generateResponse(path, err.message));
  return;
}

function generateResponse(
  path: string, 
  message: string, 
  validationErrors?:ValidationErrorResponse['validationErrors']): ErrorResponse {

  const timeStamp = new Date().getTime();
  let responseFailed: ErrorResponse;

  if (validationErrors) {
    responseFailed = {
      path,
      timeStamp,
      message,
      validationErrors,
    };
    return responseFailed;
  }

  responseFailed = {
    path,
    timeStamp,
    message,
  };
  return responseFailed;
}
