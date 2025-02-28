import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo/Telegram_logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1.2초 후 페이드 아웃 시작
    setTimeout(() => setFadeOut(true), 1200);
    // 1.5초 후 로그인 페이지로 이동
    setTimeout(() => navigate("/login"), 1500);
  }, [navigate]);

  return (
    <div
      className={`w-screen h-screen flex items-center justify-center bg-gray-800 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img src={logo} alt="logo" className="w-30"></img>
    </div>
  );
};

export default SplashScreen;
