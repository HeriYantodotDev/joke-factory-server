import { ButtonProps } from './Button.types';

export function Button({
  onClick,
  disabled,
  buttonLabel,
  children,
}: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`
        mt-4 mx-auto
        bg-blue-500 
        hover:bg-blue-600 
        text-white 
        hover:text-white 
        px-4 py-2 rounded-md"
      `}
    >
      {children? children: buttonLabel}
    </button>
  );
}