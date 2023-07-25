import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUp } from '../pages/SignUp/SignUp.component';

// Polyfill "window.fetch" used in the React component.
import 'whatwg-fetch';

// Extend Jest "expect" functionality with Testing Library assertions.
import '@testing-library/jest-dom';

import { rest } from 'msw';
import { API_ROOT_URL } from '../services/utils/fetchAPI';
import { setupServer } from 'msw/node';

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
      let requestbody;

      const server = setupServer(
        rest.post(API_ROOT_URL + '/users', async (req, res, ctx) => {

          requestbody = await req.json();
          return res(ctx.status(200));
        }),
      );
      server.listen();
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

      await user.click(button);

      expect(requestbody).toEqual(signUpNewUserData);

      server.close();
    });
  });
});