import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
const serverUrl = import.meta.env.VITE_SERVER_URL;
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
      const response = await fetch(`${serverUrl}/api/auth/login`, {
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

      // ✅ JWT 토큰 저장
      localStorage.setItem("token", data.token);

      // ✅ `user._id`를 Zustand와 localStorage에 함께 저장!
      const userData = {
        _id: data._id, // ✅ MongoDB에서 받은 유저 ID 저장
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture || "/uploads/default-avatar.png",
      };

      localStorage.setItem("user", JSON.stringify(userData)); // ✅ localStorage에 저장
      setUser(userData); // ✅ Zustand 상태 업데이트

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
