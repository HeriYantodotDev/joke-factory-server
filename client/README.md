# [Working In Progress] Joke Factory Client

# The React App Overview
- Styling
  I'm using TailwindCSS.

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
- Sign Up API Request
  - Let's create a test to submit the button. First we have to mock the back end. Why don't we try
    to test it directly with the backend. First the backend is still on progress, second, it's better to test it in isolation. 
    Here's how to mock the backend
    ```
    const mockFn = jest.fn();
    global.fetch = mockFn;
    ```
    This will mock the `fetch` function. 
    Now, here's the test:
    ```
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
    ```
  - And here's for the implementation :
    First we create states for each input, and create a function to handle the submit. 
    In the function we make a fetch request. For the fetch request, I'm using the built-in `fetch` function, and modified it a little bit, so we don't have a boilerplate code. So it's like this : 
    ```
    export const API_ROOT_URL = '/api/1.0';

    export class FetchAPI {
      static async post(apiURL: string, body: object) {
        return await fetch(API_ROOT_URL + apiURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      }
    }
    ```

    Here's the full implementation: 
    ```
    import React, { ChangeEvent, useState } from 'react';

    import {
      FetchAPI,
    } from '../../services/utils/fetchAPI';

    import { SignUpPostType } from './SignUp.component.types';

    function useInputState(initialValue: string = '') {
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
      const userNameInput = useInputState();
      const emailInput = useInputState();
      const passwordInput = useInputState();
      const passwordRepeatInput = useInputState();

      const isDisabled = checkIfButtonIsDisabled(
        passwordInput.value,
        passwordRepeatInput.value,
      );

      async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const bodyPost: SignUpPostType = {
          username: userNameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
        };

        const response = await FetchAPI.post('/users', bodyPost);

        console.log(response);  //just log it for a moment
      }

      return (
        <div>
          <form>
            <h1>Sign Up</h1>
            <label htmlFor='userName'>User Name</label>
            <input onChange={userNameInput.onchange} value={userNameInput.value} id='userName' />
            <label htmlFor='email'>Email</label>
            <input onChange={emailInput.onchange} value={emailInput.value} id='email' />
            <label htmlFor='password'>Password</label>
            <input onChange={passwordInput.onchange} value={passwordInput.value} id='password' type='password' />
            <label htmlFor='passwordRepeat'>Password Repeat</label>
            <input onChange={passwordRepeatInput.onchange} value={passwordRepeatInput.value}
              id='passwordRepeat' type='password'
            />
            <button onClick={handleSubmit} disabled={isDisabled} >Sign Up</button>
          </form>
        </div>
      );
    }
    ```
- Mock Service Worker (WSW)
  We must be creating out test, as close as possible to real user interaction. 
  Instead for mocking we can use this library: [`mswjs.io`](https://mswjs.io/)
  
  - So let's use it. First let's install it:  `npm i msw --save-dev`
  - In CRA, it already provides polyfill for fetch at node environtment, however Vite doesn't. So we have to install a library to polyfill it. `npm i whatwg-fetch --save-dev`. Here's the detail how to set it up [jestSetUp](https://github.com/mswjs/examples/blob/master/examples/with-jest/jest.setup.js) 
  - now we have to import it like this : 
    ```
    // Polyfill "window.fetch" used in the React component.
    import 'whatwg-fetch';

    // Extend Jest "expect" functionality with Testing Library assertions.
    import '@testing-library/jest-dom';
    ```
    The problem is that the Data Type for whatwg-fetch is deprecated. However it's still working. 
  - In order to check the body of the request in the server we have to implement it directly in our test: 
    ```
    import 'whatwg-fetch';

    // Extend Jest "expect" functionality with Testing Library assertions.
    import '@testing-library/jest-dom';

    import { rest } from 'msw';
    import { API_ROOT_URL } from '../services/utils/fetchAPI';
    import { setupServer } from 'msw/node';
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
    ```
  We don't have to change any implementations, since we're just replacing Mock with the real interaction with the server (msw). The test is a little bit mess up but let's refactor it later. 
- Setting up the root URL
  Since we have multiple environments, we have to set it to determine the root URL. So let's set it up in the `fetchAPI.ts` file like this. Luckily, VITE already sets up the default NODE_ENV for each development, test, or production. 
  ```
  const env = process.env.NODE_ENV;

  const root = 
    env === 'development'
      ? 'http://localhost:3000'
      : env === 'test'
        ? 'http://localhost:5173'
        : '';

  export const API_ROOT_URL = root + '/api/1.0';

  export class FetchAPI {
    static async post(apiURL: string, body: object) {
      return await fetch(API_ROOT_URL + apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }
  }
  ```
- Style
  For style, I'm using TailwindCSS. 
  Here's to start it up: 
  ```
  npm install tailwindcss @tailwindcss/typography @tailwindcss/forms postcss autoprefixer --save-dev
  npx tailwindcss init -p
  ```
  Then create a file `tailwind.config.js` (for the font I'm using Google Font)
  ```
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Lugrasimo', 'Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };

  ```
  Now let's add `index.css` to the main app, and here it is : 
  ```
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  ```
  That's it. Now we can use it. Here's the documentation [tailwindCSS](https://tailwindcss.com/)
  
- $
- $
- $
- $


# Journal

- July 22 2023 - Setting Up The client Project
  Let's begin this. Start the app with Vite 🌩️. After considering, I think I need to learn properly to do the TDD at React. Instead of trial and error, with the proper guidance, I can use this as a starting point and expand it. 
- 