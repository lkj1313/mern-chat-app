import express from "express";
import Friend from "../models/Friend.js"; // ✅ 파일 경로가 정확해야 함
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔥 1. 친구 추가 (POST /friends/add)
 * 내가 친구를 추가하면 내 목록에만 저장됨
 */
router.post("/add", protect, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    if (userId.toString() === friendId) {
      return res
        .status(400)
        .json({ message: "자기 자신을 친구로 추가할 수 없습니다." });
    }

    // 이미 친구인지 확인
    const existingFriend = await Friend.findOne({
      user: userId,
      friend: friendId,
    });

    if (existingFriend) {
      return res
        .status(400)
        .json({ message: "이미 친구 목록에 추가된 사용자입니다." });
    }

    // 친구 추가 (내 목록에만 추가됨)
    await Friend.create({ user: userId, friend: friendId });

    res.status(201).json({ message: "친구가 추가되었습니다!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

/**
 * 🔥 2. 친구 삭제 (DELETE /friends/remove/:friendId)
 * 내가 추가한 친구를 내 목록에서 삭제함
 */
router.delete("/remove/:friendId", protect, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // 친구 목록에서 삭제
    const deletedFriend = await Friend.findOneAndDelete({
      user: userId,
      friend: friendId,
    });

    if (!deletedFriend) {
      return res.status(404).json({ message: "해당 친구가 목록에 없습니다." });
    }

    res.json({ message: "친구가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

/**
 * 🔥 3. 내 친구 목록 조회 (GET /friends)
 * 내가 추가한 친구들의 목록을 가져옴
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ 친구 목록 조회 + 상대방 정보 포함
    const friends = await Friend.find({ user: userId }).populate(
      "friend",
      "_id name email profilePicture"
    );

    // ✅ `friend` 정보만 반환 (불필요한 `user`, `__v`, `_id` 제거)
    const formattedFriends = friends.map((f) => f.friend);

    res.json({ friends: formattedFriends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 특정 유저가 친구인지 확인
router.get("/check/:friendId", protect, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id; // 현재 로그인한 유저 ID

    const isFriend = await Friend.findOne({ user: userId, friend: friendId });

    res.json({ isFriend: !!isFriend });
  } catch (error) {
    console.error("친구 여부 확인 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});
export default router;
