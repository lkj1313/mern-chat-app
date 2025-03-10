import express from "express";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { Server } from "socket.io"; // ✅ Socket.io 추가
import Message from "./models/Message.js";
import Room from "./models/Room.js";

// __dirname 생성 (ES Module 호환)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import directChatRoutes from "./routes/directChatRoutes.js";

dotenv.config();
const app = express();

// HTTP 서버와 Socket.IO 설정
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React 클라이언트 주소
    methods: ["GET", "POST"],
  },
});
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
app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/directChat", directChatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ✅ 이미지 업로드 API 추가
app.post("/api/messages/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "이미지가 업로드되지 않았습니다." });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ 소켓 이벤트 설정
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // ✅ 특정 방에 참가 (join)
  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);

    try {
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: 1 }) // 오래된 메시지부터 정렬
        .populate("sender", "name profilePicture"); // ✅ sender 필드에 닉네임과 프로필 포함

      console.log("🔹 Loaded Messages:", messages); // ✅ 메시지 데이터 확인

      socket.emit("load_messages", messages); // ✅ 클라이언트에 메시지 전송
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      // ✅ 새 메시지 저장
      const newMessage = await Message.create({
        room: data.room,
        sender: data.sender,
        message: data.message || "", // ✅ 텍스트 메시지
        imageUrl: data.imageUrl || null, // ✅ 이미지 메시지
        timestamp: new Date(),
      });

      // ✅ sender 정보 포함하여 클라이언트에 전송
      const populatedMessage = await newMessage.populate(
        "sender",
        "name profilePicture"
      );

      // ✅ Room 컬렉션 최신 메시지 업데이트
      await Room.findByIdAndUpdate(data.room, {
        $set: {
          lastMessage: data.message || "[이미지]",
          lastMessageSender: data.sender,
          lastMessageAt: new Date(),
        },
      });

      // ✅ 메시지 전송
      io.to(data.room).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("❌ Message save failed:", error);
    }
  });

  // ✅ 사용자 연결 해제
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
