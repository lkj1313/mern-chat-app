import { useState } from "react";

type InputFieldProps = {
  placeholder: string;
  type?: string;
  onValidate?: (value: string) => boolean;
  errorMessage?: string;
  value: string; // 추가
  onChange: (value: string) => void; // 추가
  width?: string; // width 추가
};

const InputField = ({
  placeholder,
  type = "text",
  onValidate,
  errorMessage,
  value,
  onChange,
  width = "w-80", // 기본 너비를 w-80으로 설정
}: InputFieldProps) => {
  const [isValid, setIsValid] = useState(true);

  const handleBlur = () => {
    if (onValidate) {
      setIsValid(onValidate(value));
    }
  };

  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        className={`text-white ${width} h-10 border-b ${
          isValid ? "border-gray-200" : "border-red-500"
        } focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
      />
      {!isValid && errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </>
  );
};

export default InputField;
