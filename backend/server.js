import express from "express";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { Server } from "socket.io"; // ✅ Socket.io 추가

// ✅ 라우트 가져오기
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import directChatRoutes from "./routes/directChatRoutes.js";

// ✅ ES 모듈 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 환경 변수 로드
dotenv.config();
const app = express();

// ✅ HTTP 서버 & Socket.io 설정
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // 로컬 개발 환경
      "https://3.26.153.179.nip.io", // 🔥 배포된 클라이언트 추가
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Express CORS 설정
app.use(
  cors({
    origin: ["http://localhost:5173", "https://3.26.153.179.nip.io"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ 기본 미들웨어
app.use(express.json());

// ✅ 정적 파일 제공 (업로드된 이미지 접근)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ 이미지 업로드 API
app.post("/api/messages/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "이미지가 업로드되지 않았습니다." });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// ✅ 라우트 설정
app.use("/api/auth", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/directChat", directChatRoutes);

// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Socket.io 이벤트 핸들링
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    console.log(`🔹 User ${socket.id} joined room: ${roomId}`);

    try {
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: 1 }) // 오래된 메시지부터 정렬
        .populate("sender", "name profilePicture");

      socket.emit("load_messages", messages);
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = await Message.create({
        room: data.room,
        sender: data.sender,
        message: data.message || "",
        imageUrl: data.imageUrl || null,
        timestamp: new Date(),
      });

      const populatedMessage = await newMessage.populate(
        "sender",
        "name profilePicture"
      );

      // ✅ Room 또는 DirectChat 컬렉션 업데이트
      const room = await Room.findById(data.room);
      if (room) {
        await Room.findByIdAndUpdate(data.room, {
          $set: {
            lastMessage: data.message || "[이미지]",
            lastMessageSender: data.sender,
            lastMessageAt: new Date(),
          },
        });
      } else {
        await DirectChat.findByIdAndUpdate(data.room, {
          $set: {
            lastMessage: data.message || "[이미지]",
            lastMessageSender: data.sender,
            lastMessageAt: new Date(),
          },
        });
      }

      io.to(data.room).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("❌ Message save failed:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
