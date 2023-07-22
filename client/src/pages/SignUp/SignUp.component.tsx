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