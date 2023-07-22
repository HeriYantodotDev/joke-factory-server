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
  - 
  - 
- 


# Journal

- July 22 2023 - Setting Up The client Project
  Let's begin this. Start the app with Vite 🌩️. After considering, I think I need to learn properly to do the TDD at React. Instead of trial and error, with the proper guidance, I can use this as a starting point and expand it. 
- 