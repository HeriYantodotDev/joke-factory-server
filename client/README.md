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
    ``
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

- Form: Input Processing
  - The button in this form is disable initially. Let's make the button is enable after the password & password repeat has the same value.
    - test
      ```
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
      
      ```
    - implementation 
      As you can see above, we're using React State to update the value of the password. We're using
      custom hooks for the sake of readibility and maintainability. Then to check for whether the button should be disabled or not, we simply check everytime the component is rerendered. Everytime we change the state, React will rerender the component. 
      ```
      import { ChangeEvent, useState } from 'react';

      function usePasswordInputState(initialValue: string = '') {
        const [value, setValue] = useState<string>(initialValue);
        function handlechange(event: ChangeEvent<HTMLInputElement>) {
          setValue(event.target.value);
        }

        return {
          value,
          onchange: handlechange,
        };
      }

      function checkIfButtonIsDisabled(password: string, passwordRepeat: string) {
        return !(password && passwordRepeat)
          || password !== passwordRepeat;
      }

      export function SignUp() {
        const passwordInput = usePasswordInputState();
        const passwordRepeatInput = usePasswordInputState();

        const isDisabled = checkIfButtonIsDisabled(
          passwordInput.value,
          passwordRepeatInput.value,
        );

        return (
          <div>
            <h1>Sign Up</h1>
            <label htmlFor='userName'>User Name</label>
            <input id='userName' />
            <label htmlFor='email'>Email</label>
            <input id='email' />
            <label htmlFor='password'>Password</label>
            <input onChange={passwordInput.onchange} value={passwordInput.value} id='password' type='password' />
            <label htmlFor='passwordRepeat'>Password Repeat</label>
            <input onChange={passwordRepeatInput.onchange} value={passwordRepeatInput.value}
              id='passwordRepeat' type='password'
            />
            <button disabled={isDisabled} >Sign Up</button>
          </div>
        );
      }
      ```
  - 

- 


# Journal

- July 22 2023 - Setting Up The client Project
  Let's begin this. Start the app with Vite 🌩️. After considering, I think I need to learn properly to do the TDD at React. Instead of trial and error, with the proper guidance, I can use this as a starting point and expand it. 
- 