import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUp } from '../pages/SignUp/SignUp.component';

function setup(jsx: JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  }
}

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

      await user.type(passwordInput, 'T3rl4lu@123');
      await user.type(passwordRepeatinput, 'T3rl4lu@123');
      const button = screen.queryByRole('button', { name: 'Sign Up' });
      expect(button).toBeEnabled();

    });
  });
});