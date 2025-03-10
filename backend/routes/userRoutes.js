import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import {
  uploadProfilePicture,
  uploadProfilePictureHandler,
} from "../controllers/userController.js";
const router = express.Router();
dotenv.config();

// 회원가입 API
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 이미 가입된 이메일인지 확인
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }

    // 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 새로운 사용자 생성
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePicture: "/uploads/default-avatar.png",
    });

    // JWT 토큰 생성
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 에러 발생" });
  }
});
// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일이 존재하는지 확인
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 비밀번호 확인 (bcrypt.compare)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    // 로그인 성공 응답
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 에러 발생" });
  }
});
// 프로필 이미지 업로드 라우트
router.post(
  "/upload-profile-picture",
  uploadProfilePicture,
  uploadProfilePictureHandler
);

// 특정 유저 정보 가져오기
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password"); // 비밀번호 제외
    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "서버 에러 발생" });
  }
});
export default router;
