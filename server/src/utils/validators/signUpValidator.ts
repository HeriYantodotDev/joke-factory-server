import Joi from 'joi';
import { Validator } from './Validator';
import { ResponseUserCreatedFailed, SIGNUP_STATUS, UserHelperModel } from '../../models';

export const signUpSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least 1 uppercase,' +
        ' 1 lowercase, 1 symbol, and 1 number.',
    }),
});

export function signUpValidationErrorGenerator(
  signUpValidator: Validator
): object | undefined {
  const validationErrors: Record<string, string> = {};

  let responseError: ResponseUserCreatedFailed | undefined = undefined;

  if ( signUpValidator.error && signUpValidator.errorMessage ) {
    signUpValidator.error.details.forEach((errorDetail) => {
      const fieldName = errorDetail.context?.key || '';
      const errorMessage = errorDetail.message;
      //a field might have a lot of errors. we only want to capture the first error 
      if (!validationErrors[fieldName]) {
        validationErrors[fieldName] = errorMessage;
      }
    });

    responseError = {
      signUpStatus: SIGNUP_STATUS.failed,
      message: signUpValidator.errorMessage,
      validationErrors,
    };
  }
  return responseError;
} 

  export async function checkUsernameExist(data: string): Promise<void> {
    const userExist = await UserHelperModel.userExistsByUserName(data);
    if (userExist) {
      throw new Error(`Username: ${data} already exists`);
    }
  }

// export async function checkEmailExist(data: string): Promise<void> {
//   const userExist = await UserHelperModel.userExistsByEmail(data);
//   if (userExist) {
//     throw new Error(`Email: ${data} already exists`);
//   }
// }


// if (await UserHelperModel.userExistsByUserName(newUserData.username)) {
//   throw new UserExistsError(`Username: ${newUserData.username} already exists`, 'username');
// }

// if (await UserHelperModel.userExistsByEmail(newUserData.email)) {
//   throw new UserExistsError(`Email: ${newUserData.email} already exists`, 'email');
// }