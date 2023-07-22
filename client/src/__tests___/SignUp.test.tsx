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