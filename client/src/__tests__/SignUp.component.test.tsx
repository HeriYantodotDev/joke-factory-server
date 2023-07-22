import { render, screen } from '@testing-library/react';
import { SignUp } from '../pages/SignUp/SignUp.component';

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
});