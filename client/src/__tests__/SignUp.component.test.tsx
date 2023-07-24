import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUp } from '../pages/SignUp/SignUp.component';

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const signUpNewUserData = {
  username: 'test1',
  email: 'test1@gmail.com',
  password: 'T3rl4lu@123',
};


describe('Sign Up Page', () => {
  describe('Layout', () => {
    test('has a header', () => {
      render(<SignUp />);
      const header = screen.queryByRole(
        'heading',
        { name: 'Sign Up' },
      );
      expect(header).toBeInTheDocument();
    });

    test('has a username input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('User Name');
      expect(input).toBeInTheDocument();
    });

    test('has an email input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
    });

    test('has a password input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('Password');
      expect(input).toBeInTheDocument();
    });

    test('has password type for password input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('Password');

      if (!(input instanceof HTMLInputElement)) {
        fail('Input element is not an HTMLInputElement.');
      }
      expect(input.type).toBe('password');
    });

    test('has a password repeat input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('Password Repeat');
      expect(input).toBeInTheDocument();
    });

    test('has password type for password repeat input', () => {
      render(<SignUp />);
      const input = screen.getByLabelText('Password Repeat');

      if (!(input instanceof HTMLInputElement)) {
        fail('Input element is not an HTMLInputElement.');
      }
      expect(input.type).toBe('password');
    });

    test('has a sign up button', () => {
      render(<SignUp />);
      const button = screen.queryByRole(
        'button',
        { name: 'Sign Up' },
      );
      expect(button).toBeInTheDocument();
    });

    test('disables the button initially', () => {
      render(<SignUp />);
      const button = screen.queryByRole(
        'button',
        { name: 'Sign Up' },
      );
      expect(button).toBeDisabled();
    });



  });

  describe('Interaction', () => {
    test('enables the button when password and password repeat has the same value ', async () => {
      const { user } = setup(< SignUp />);
      const passwordInput = screen.getByLabelText('Password');
      const passwordRepeatinput = screen.getByLabelText('Password Repeat');

      await user.type(passwordInput, signUpNewUserData.password);
      await user.type(passwordRepeatinput, signUpNewUserData.password);
      const button = screen.queryByRole('button', { name: 'Sign Up' });
      expect(button).toBeEnabled();

    });

    test('sends username, email, and password to backend after clicking the button', async () => {
      const { user } = setup(< SignUp />);
      const userNameInput = screen.getByLabelText('User Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const passwordRepeatinput = screen.getByLabelText('Password Repeat');

      await user.type(userNameInput, signUpNewUserData.username);
      await user.type(emailInput, signUpNewUserData.email);
      await user.type(passwordInput, signUpNewUserData.password);
      await user.type(passwordRepeatinput, signUpNewUserData.password);
      const button = screen.queryByRole('button', { name: 'Sign Up' });
      if (!button) {
        fail('Button is not found');
      }

      const mockFn = jest.fn();

      global.fetch = mockFn;

      await user.click(button);

      const firstCallOfMockFn = mockFn.mock.calls[0];
      const body = JSON.parse(firstCallOfMockFn[1].body);
      expect(body).toEqual(signUpNewUserData);

    });
  });
});