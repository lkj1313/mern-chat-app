import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리디렉션
    return <Navigate to="/login" replace />;
  }

  // 토큰이 있으면 하위 라우트를 렌더링 (자식 컴포넌트)
  return <Outlet />;
};

export default PrivateRoute;
