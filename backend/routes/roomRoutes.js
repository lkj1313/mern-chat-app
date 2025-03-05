import express from "express";
import multer from "multer";
import Room from "../models/Room.js";
import { protect } from "../middleware/authMiddleware.js"; // JWT 인증 미들웨어
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
// ✅ `multer` 설정 (파일 저장 경로 및 이름 지정)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ✅ 파일을 `uploads/` 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // ✅ 파일명을 현재 시간 + 원래 이름으로 저장
  },
});
const upload = multer({ storage });

// ✅ 1️⃣ 대화방 생성 API (로그인 필요)
router.post(
  "/create",
  protect,
  upload.single("roomImage"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const createdBy = req.user._id; // JWT 토큰에서 로그인한 사용자 ID 가져오기

      // ✅ 업로드된 파일이 있으면 파일 경로 사용, 없으면 기본 이미지
      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : "/uploads/Telegram_logo.png";

      // ✅ 새 대화방 생성
      const newRoom = new Room({
        name,
        image: imageUrl, // ✅ 업로드된 이미지 경로 또는 기본 이미지
        createdBy, // 방장 ID 저장
        users: [createdBy], // 방장은 기본적으로 참여자로 포함
      });

      await newRoom.save();
      res
        .status(201)
        .json({ message: "Room created successfully!", room: newRoom });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ 대화방 목록 조회 (최신 메시지 포함)
router.get("/", protect, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("lastMessageSender", "name profilePicture") // ✅ 보낸 사람의 이름과 프로필 가져오기
      .select("name image lastMessage lastMessageSender lastMessageAt");

    // ✅ 환경 변수에서 서버 URL 가져오기
    const serverUrl = process.env.SERVER_URL || "http://localhost:5005"; // 기본값 설정

    // ✅ 응답 데이터 형식 변환
    const formattedRooms = rooms.map((room) => ({
      _id: room._id,
      name: room.name,
      image: room.image
        ? room.image.startsWith("/uploads/")
          ? `${serverUrl}${room.image}` // ✅ 서버 주소 추가
          : room.image
        : "https://via.placeholder.com/150", // ✅ 기본 이미지
      lastMessage: room.lastMessage || "", // ✅ 최신 메시지
      lastMessageSender: room.lastMessageSender
        ? room.lastMessageSender.name
        : "", // ✅ 보낸 사람 이름 포함
      lastMessageAt: room.lastMessageAt || null, // ✅ 최신 메시지 시간 추가
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// ✅ 2️⃣ 특정 대화방 정보 조회 API (방장 정보 포함)
router.get("/:id", protect, async (req, res) => {
  try {
    // `createdBy` 필드에서 `name`과 `email`을 가져와서 함께 반환
    const room = await Room.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
