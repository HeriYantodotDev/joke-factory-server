import { FormInputProps } from './FormInput.types';

export function FormInput({
  labelName,
  htmlFor,
  onChange,
  value,
  id,
  type,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={htmlFor}
        className={`
          block mt-2
          text-left
        `}
      >
        {labelName}
      </label>
      <input onChange={onChange} value={value} id={id} type={type? type : 'text'}
        className = { `
        focus:bg-violet-100 
          border-2 border-gray-300 
          rounded-md px-2 py-1 my-2
          w-full

          text-left
        `}
      />
    </div>
  );
}