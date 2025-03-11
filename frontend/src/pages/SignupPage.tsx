import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
const serverUrl = import.meta.env.VITE_SERVER_URL;
const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  // 유효성 검사 상태
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8;

  // 입력값 변경 핸들러
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 이메일 유효성 검사
  const handleEmailChange = (value: string) => {
    handleChange("email", value);
    setIsEmailValid(validateEmail(value)); // 이메일 유효성 업데이트
  };

  // 비밀번호 유효성 검사
  const handlePasswordChange = (value: string) => {
    handleChange("password", value);
    setIsPasswordValid(validatePassword(value)); // 비밀번호 유효성 업데이트
  };

  // `fetch`를 이용한 회원가입 API 요청
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${serverUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // JSON 데이터 변환

      if (!response.ok) {
        throw new Error(data.message || "회원가입 실패");
      }

      alert("회원가입 완료! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error: any) {
      console.error("회원가입 실패:", error.message);
      alert(error.message);
    }
  };

  // 버튼 비활성화 조건
  const isSubmitDisabled = !(isEmailValid && isPasswordValid);

  return (
    <div className="bg-gray-800 flex flex-col pt-40 items-center">
      <h1 className="font-bold text-4xl text-gray-200 mb-10">Signup</h1>
      <form className="flex flex-col gap-5 mb-5" onSubmit={handleSignup}>
        <InputField
          placeholder="Email"
          type="email"
          onValidate={validateEmail}
          errorMessage="이메일 형식이 틀립니다."
          value={formData.email}
          onChange={handleEmailChange} // 이메일 변경 핸들러 호출
        />
        <InputField
          placeholder="Name"
          type="text"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
        />
        <InputField
          placeholder="Password"
          type="password"
          onValidate={validatePassword}
          errorMessage="비밀번호는 8자 이상이어야 합니다."
          value={formData.password}
          onChange={handlePasswordChange} // 비밀번호 변경 핸들러 호출
        />
        <button
          type="submit"
          className={`w-80 h-10 ${
            isSubmitDisabled ? "bg-gray-400" : "bg-green-500"
          } ${isSubmitDisabled ? "cursor-not-allowed" : "cursor-pointer "}`}
          disabled={isSubmitDisabled} // 유효성 검사를 통과하지 않으면 비활성화
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
