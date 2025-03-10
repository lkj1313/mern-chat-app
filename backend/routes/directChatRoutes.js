import express from "express";
import DirectChat from "../models/DirectChat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ 1:1 채팅 생성 (기존 방이 있으면 반환)
router.post("/create", protect, async (req, res) => {
  try {
    const { id } = req.body;
    const currentUserId = req.user.id;

    // ✅ 기존 1:1 채팅방이 있는지 확인
    let chat = await DirectChat.findOne({
      users: { $all: [currentUserId, id] },
    }).populate("users", "name profilePicture email");

    if (!chat) {
      // ✅ 기존 방이 없으면 새로 생성
      chat = await DirectChat.create({
        users: [currentUserId, id],
      });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("❌ 1:1 채팅방 생성 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

export default router;
