import { signUpValidator } from '../utils';

describe('Testing Validator', () => {
  test('Validator property error will be undefined if no error and vise versa', () => {
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
