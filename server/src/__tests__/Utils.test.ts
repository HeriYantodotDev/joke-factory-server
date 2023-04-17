import { signUpValidator } from '../utils';
import { checkingJSONRequest } from '../utils';
import { Request, Response, NextFunction } from 'express';
import { ErrorMessageInvalidJSON } from '../utils';


describe('Testing Validator', () => {
  test('error in Validator is undefined if no error - vise versa', () => {
    const user1 = {
      username: '',
      email: 'happy@gmail.com',
      password: 'A4GuaN@SmZ',
    };

    const user2 = {
      username: 'user1',
      email: 'happy@gmail.com',
      password: 'A4GuaN@SmZ',
    };

    signUpValidator.validate(user1);

    expect(signUpValidator.error !== undefined).toBe(true);

    signUpValidator.validate(user2);

    expect(signUpValidator.error === undefined).toBe(true);
  });
});

describe('checkingJSONRequest middleware', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn(() => mockResponse),
    send: jest.fn(),
  } as unknown as Response;
  const mockNext = jest.fn() as unknown as NextFunction;

  test('Returns 400 with an error message when it encounters an invalid JSON request', () => {
    const mockError = new SyntaxError('Invalid JSON line ...');

    checkingJSONRequest()(mockError, mockRequest, mockResponse, mockNext);

    const expectedErrorResponse: ErrorMessageInvalidJSON = {
      error: 'Invalid JSON',
      message: 'Invalid JSON line ...',
    };
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith(expectedErrorResponse);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('Passes through when JSON request is valid', () => {
    checkingJSONRequest()(null, mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});

