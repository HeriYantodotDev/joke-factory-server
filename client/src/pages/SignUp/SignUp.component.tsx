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