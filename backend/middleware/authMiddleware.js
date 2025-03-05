import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler"; // 비동기 핸들러 (에러 처리를 쉽게 하기 위해)

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 요청 헤더에서 Bearer 토큰 확인
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // "Bearer {TOKEN}"
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ JWT 검증

      req.user = await User.findById(decoded.id).select("-password"); // ✅ 사용자 정보 저장 (비밀번호 제외)

      next(); // 다음 미들웨어 실행
    } catch (error) {
      console.error("JWT 인증 실패:", error);
      res.status(401);
      throw new Error("토큰이 유효하지 않습니다.");
    }
  } else {
    res.status(401);
    throw new Error("인증 토큰이 없습니다.");
  }
});
