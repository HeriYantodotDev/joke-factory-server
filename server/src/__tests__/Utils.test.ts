import { signUpValidator } from '../utils';

describe('Testing Validator', () => {
  test('Validator property error will be undefined if no error and vise versa', () => {
    const user1 = {
      username: '',
      email: 'happy@gmail.com',
      password: '123JuJu7$$123;',
    };

    const user2 = {
      username: 'user1',
      email: 'happy@gmail.com',
      password: 'asdfd',
    };

    signUpValidator.validate(user1);

    expect(signUpValidator.error !== undefined).toBe(true);

    signUpValidator.validate(user2);

    expect(signUpValidator.error === undefined).toBe(true);
  });
});
