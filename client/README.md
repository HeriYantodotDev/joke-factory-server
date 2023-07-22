# [Working In Progress] Joke Factory Client

# The React App Overview

# Development

First of all, for testing here are the libraries that we should install: 
```
 "@testing-library/jest-dom": "^5.16.5",
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.4.3",
  "@types/jest": "^29.5.2",
  "jest": "^29.6.1",
  "jest-environment-jsdom": "^29.6.1",
  "ts-jest": "^29.1.1",
```
Piuh ... That's a lot! Isn't it!
Here's a great blog to set it up: [jest-vite](https://hung.dev/posts/jest-vite)


# TDD Process

I'm documenting the process I'm creating this for my future reference. 

## Sign Up 
[Sign Up Page Component](./src/components/SignUp/SignUp.component.tsx)

- The first test
  - Let's create our first test for the first component which is `SignUp`.
    ```
    import { render, screen } from '@testing-library/react';
    import { SignUp } from '../components/SignUp/SignUp.component';

    test('has a header', () => {
      render(<SignUp />);
      const header = screen.queryByRole(
        'heading',
        { name: 'Sign Up' },
      );
      expect(header).toBeInTheDocument();
    });
    ```

    Now here's the implementation. It's very easy, just need to create a react component, a header and then give it an inner HTML `Sign Up`

    ```
    export function SignUp() {
      return (
        <div>
          <h1>Sign Up</h1>
        </div>
      );
    }
    ```

    Okay, I think that is a good start.
- Sign Up Form Layout
  This is a very simple test to check the layout. So just check the basic layout.
  - Test:
    ```
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
    ```
  - Implementation: 
    ```
      export function SignUp() {
        return (
          <div>
            <h1>Sign Up</h1>
            <label htmlFor='userName'>User Name</label>
            <input id='userName' />
            <label htmlFor='email'>Email</label>
            <input id='email' />
            <label htmlFor='password'>Password</label>
            <input id='password' type='password' />
            <label htmlFor='passwordRepeat'>Password Repeat</label>
            <input id='passwordRepeat' type='password' />
            <button disabled>Sign Up</button>
          </div>
        );
      }
    ```

- 


# Journal

- July 22 2023 - Setting Up The client Project
  Let's begin this. Start the app with Vite 🌩️. After considering, I think I need to learn properly to do the TDD at React. Instead of trial and error, with the proper guidance, I can use this as a starting point and expand it. 
- 