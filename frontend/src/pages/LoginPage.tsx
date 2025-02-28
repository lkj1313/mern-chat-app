import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 입력값 변경 핸들러
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5005/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "로그인 실패");
      }

      console.log("로그인 성공:", data);
      localStorage.setItem("token", data.token); // JWT 토큰 저장
      // Zustand로 유저 정보 업데이트
      setUser({
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture || "/uploads/default-avatar.png", // 기본 이미지 경로
      });

      navigate("/home"); // 로그인 성공 후 페이지 이동
    } catch (error: any) {
      console.error("로그인 실패:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="bg-gray-800 flex flex-col pt-40">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-4xl text-gray-200 mb-10">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-5 mb-5">
          <InputField
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
          />
          <InputField
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleChange("password", value)}
          />
          <button
            type="submit"
            className="w-80 h-10 bg-blue-500 cursor-pointer"
          >
            Login
          </button>
        </form>
        <button
          onClick={() => navigate("/signup")}
          className="w-80 h-10 bg-green-500 cursor-pointer"
        >
          Signup
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
