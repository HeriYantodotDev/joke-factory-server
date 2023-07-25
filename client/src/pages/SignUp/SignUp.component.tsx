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

    response;  //just log it for a moment
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