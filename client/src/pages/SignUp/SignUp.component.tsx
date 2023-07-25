import React, { ChangeEvent, useState } from 'react';

import {
  FetchAPI,
} from '../../services/utils/fetchAPI';

import { SignUpPostType } from './SignUp.component.types';

import { FormInput } from '../../components/FormInput/FormInput.component';
import { Button } from '../../components/Button/Button.component';

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

    response;  //just log it for a moment
  }

  return (
    <div className='flex justify-center items-center' >
      <form className='w-96 text-center border'>
        <div className='flex bg-gray-100 justify-center items-center h-20 border-b-2 ' >
          <h1 className='text-4xl font-bold text-blue-600 ' >
            Sign Up
          </h1>
        </div>

        <div className='mx-6 my-6'>
          <FormInput 
            labelName='User Name'
            htmlFor='userName'
            onChange={userNameInput.onchange}
            value={userNameInput.value}
            id='userName'
          />
          <FormInput 
            labelName='Email'
            htmlFor='email'
            onChange={emailInput.onchange}
            value={emailInput.value}
            id='email'
          />
          <FormInput 
            labelName='Password'
            htmlFor='password'
            onChange={passwordInput.onchange}
            value={passwordInput.value}
            id='password'
            type='password'
          />
          <FormInput 
            labelName='Password Repeat'
            htmlFor='passwordRepeat'
            onChange={passwordRepeatInput.onchange}
            value={passwordRepeatInput.value}
            id='passwordRepeat'
            type='password'
          />
          <Button onClick={handleSubmit} disabled={isDisabled}>
            Sign Up
          </Button>
        </div>

      </form>
    </div>
  );
}