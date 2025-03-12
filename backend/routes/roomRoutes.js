import express from "express";
import multer from "multer";
import Room from "../models/Room.js";
import DirectChat from "../models/DirectChat.js";
import Message from "../models/Message.js";
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
      console.log(1);
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

// // ✅ 대화방 목록 조회 (최신 메시지 포함)
// router.get("/", protect, async (req, res) => {
//   try {
//     const rooms = await Room.find()
//       .populate("lastMessageSender", "name profilePicture") // ✅ 보낸 사람의 이름과 프로필 가져오기
//       .select("name image lastMessage lastMessageSender lastMessageAt");

//     // ✅ 환경 변수에서 서버 URL 가져오기
//     const serverUrl = process.env.SERVER_URL || "http://localhost:5005"; // 기본값 설정

//     // ✅ 응답 데이터 형식 변환
//     const formattedRooms = rooms.map((room) => ({
//       _id: room._id,
//       name: room.name,
//       image: room.image
//         ? room.image.startsWith("/uploads/")
//           ? `${serverUrl}${room.image}` // ✅ 서버 주소 추가
//           : room.image
//         : "https://via.placeholder.com/150", // ✅ 기본 이미지
//       lastMessage: room.lastMessage || "", // ✅ 최신 메시지
//       lastMessageSender: room.lastMessageSender
//         ? room.lastMessageSender.name
//         : "", // ✅ 보낸 사람 이름 포함
//       lastMessageAt: room.lastMessageAt || null, // ✅ 최신 메시지 시간 추가
//     }));

//     res.status(200).json(formattedRooms);
//   } catch (error) {
//     console.error("❌ Error fetching rooms:", error);
//     res.status(500).json({ message: "서버 오류 발생" });
//   }
// });

// ✅ 내가 참여한 대화방 목록 조회 (최신 메시지 포함)
router.get("/my", protect, async (req, res) => {
  try {
    const userId = req.user._id; // ✅ 현재 로그인한 사용자 ID

    const rooms = await Room.find({ users: userId }) // ✅ 내가 참여한 방만 필터링
      .populate("lastMessageSender", "name profilePicture")
      .select("name image lastMessage lastMessageSender lastMessageAt");

    const serverUrl = process.env.SERVER_URL || "http://localhost:5005"; // 기본값 설정

    const formattedRooms = rooms.map((room) => ({
      _id: room._id,
      name: room.name,
      image: room.image
        ? room.image.startsWith("/uploads/")
          ? `${serverUrl}${room.image}`
          : room.image
        : "https://via.placeholder.com/150", // 기본 이미지
      lastMessage: room.lastMessage || "",
      lastMessageSender: room.lastMessageSender
        ? room.lastMessageSender.name
        : "",
      lastMessageAt: room.lastMessageAt || null,
    }));

    res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("❌ Error fetching my rooms:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

router.get("/all", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("🔍 현재 로그인한 사용자 ID:", userId); // ✅ 유저 확인
    // ✅ 유저가 속한 일반 채팅방 (그룹)
    const groupRooms = await Room.find({ users: userId })
      .populate("lastMessageSender", "name profilePicture")
      .select("name image lastMessage lastMessageSender lastMessageAt");

    // ✅ 유저가 속한 1:1 채팅방
    const directRooms = await DirectChat.find({ users: userId })
      .populate("users", "name profilePicture email")
      .populate("lastMessageSender", "name profilePicture")
      .select("users lastMessage lastMessageSender lastMessageAt");
    // ✅ MongoDB에서 가져온 데이터 확인 (로그 찍기)
    console.log(
      "📌 [BEFORE PROCESSING] groupRooms:",
      groupRooms.map((r) => r.image)
    );
    console.log("📌 [BEFORE PROCESSING] directRooms:");

    const formattedGroupRooms = groupRooms.map((room) => ({
      _id: room._id,
      type: "group",
      name: room.name,
      image: room.image,

      lastMessage: room.lastMessage || "",
      lastMessageSender: room.lastMessageSender
        ? room.lastMessageSender.name
        : "",
      lastMessageAt: room.lastMessageAt ? room.lastMessageAt : null, // ✅ 기본값을 `null`로 변경
    }));

    // ✅ 1:1 채팅 데이터 가공 (`directChatPartnerId` 추가)
    const formattedDirectRooms = directRooms.map((room) => {
      const otherUser = room.users.find(
        (user) => user._id.toString() !== userId.toString()
      );

      return {
        _id: room._id,
        type: "direct",
        name: otherUser ? otherUser.name : "알 수 없는 사용자",
        image: otherUser
          ? otherUser.profilePicture.startsWith("/uploads/")
            ? otherUser.profilePicture
            : "/uploads/default.png"
          : "/uploads/default.png",
        lastMessage: room.lastMessage || "",
        lastMessageSender: room.lastMessageSender
          ? room.lastMessageSender.name
          : "",
        lastMessageAt: room.lastMessageAt ? room.lastMessageAt : null, // ✅ 기본값을 `null`로 변경
        directChatPartnerId: otherUser ? otherUser._id : null, // ✅ 상대방 ID 추가
      };
    });

    // ✅ 그룹 채팅 + 1:1 채팅 통합 후 최신 메시지 순으로 정렬
    const rooms = [...formattedGroupRooms, ...formattedDirectRooms].sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.status(200).json(rooms);
  } catch (error) {
    console.error("❌ 대화 목록 불러오기 실패:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 특정 대화방 정보 조회 API (방장 정보 포함)
router.get("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "name email profilePicture")
      .populate("users", "name email profilePicture"); // ✅ 참여한 사용자 목록 포함

    if (!room) {
      return res.status(404).json({ message: "대화방을 찾을 수 없습니다." });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

//대화방 참가
router.put("/:id/join", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // ✅ JWT에서 가져온 로그인한 사용자 ID

    // ✅ 대화방 찾기
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "대화방을 찾을 수 없습니다." });
    }

    // ✅ 이미 참가한 사용자라면 추가하지 않음
    if (room.users.includes(userId)) {
      return res
        .status(200)
        .json({ message: "이미 대화방에 참가한 사용자입니다.", room });
    }

    // ✅ 사용자 추가
    room.users.push(userId);
    await room.save();

    res.status(200).json({ message: "대화방에 입장했습니다.", room });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});
// ✅ 4️⃣ 대화방 나가기 API (PUT 요청)
router.put("/:id/leave", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // ✅ 현재 로그인한 사용자 ID

    // ✅ 대화방 찾기
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "대화방을 찾을 수 없습니다." });
    }

    // ✅ 이미 방에 참여하고 있는지 확인
    if (!room.users.includes(userId)) {
      return res
        .status(400)
        .json({ message: "이 방에 참여하고 있지 않습니다." });
    }

    // ✅ 방에서 사용자 제거
    room.users = room.users.filter(
      (user) => user.toString() !== userId.toString()
    );

    await room.save();
    res.status(200).json({ message: "방을 나갔습니다.", room });
  } catch (error) {
    console.error("❌ Error leaving room:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 대화방 삭제 API (방장만 삭제 가능)
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // ✅ 현재 로그인한 사용자 ID

    // ✅ 삭제할 대화방 찾기
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "대화방을 찾을 수 없습니다." });
    }

    // ✅ 방장인지 확인
    if (room.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "방장만 대화방을 삭제할 수 있습니다." });
    }

    // ✅ 대화방 삭제
    await Room.findByIdAndDelete(id);

    res.status(200).json({ message: "대화방이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// ✅ 특정 방의 이미지지 목록 가져오기 API
router.get("/:roomId/image", protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    // ✅ 해당 방에서 이미지 메세지 찾기
    const ImageMessages = await Message.find({
      room: roomId,
      imageUrl: { $exists: true, $ne: null },
    })
      .select("imageUrl sender createdAt")
      .populate("sender", "name profilePicture"); // ✅ 보낸 사람 정보 포함
    console.log(ImageMessages);
    res.status(200).json(ImageMessages);
  } catch (error) {
    console.error("❌ Error fetching room media:", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

export default router;
