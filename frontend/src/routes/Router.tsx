import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreenPage from "../pages/SplashScreenPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HomePage from "../pages/HomePage";
import PrivateRoute from "./PrivateRoute";
import CreateRoomPage from "../pages/CreateRoomPage";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreenPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* PrivateRoute로 보호된 경로 */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="create-room" element={<CreateRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
