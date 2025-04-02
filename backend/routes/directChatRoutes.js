import express from "express";
import DirectChat from "../models/DirectChat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//  1:1 채팅 생성 (기존 방이 있으면 반환)
router.post("/create", protect, async (req, res) => {
  try {
    const { id } = req.body;
    const currentUserId = req.user.id;
    console.log("🔍 [DEBUG] 받은 users 데이터:", req.body.users); //  users 값 확인

    //  기존 1:1 채팅방이 있는지 확인
    let chat = await DirectChat.findOne({
      users: { $all: [currentUserId, id] },
    }).populate("users", "name profilePicture email");

    if (!chat) {
      //  기존 방이 없으면 새로 생성
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

router.get("/my-direct-chats", protect, async (req, res) => {
  try {
    const userId = req.user._id; // ✅ 현재 로그인한 사용자 ID

    // ✅ 유저가 포함된 1:1 채팅방 조회
    const chats = await DirectChat.find({ users: userId })
      .populate("users", "name profilePicture email")
      .populate("lastMessageSender", "name profilePicture")
      .select("users lastMessage lastMessageSender lastMessageAt");

    console.log("🔹 1:1 채팅 목록:", chats); // ✅ 디버깅 로그

    const formattedChats = chats.map((chat) => {
      // 상대방 정보 가져오기 (현재 유저가 아닌 다른 유저)
      const otherUser = chat.users.find(
        (user) => user._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              name: otherUser.name,
              profilePicture: otherUser.profilePicture,
            }
          : null,
        lastMessage: chat.lastMessage || "",
        lastMessageSender: chat.lastMessageSender
          ? chat.lastMessageSender.name
          : "",
        lastMessageAt: chat.lastMessageAt || null,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    console.error("❌ 1:1 채팅방 목록 조회 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

export default router;
