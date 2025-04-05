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
import DirectChat from "./models/DirectChat.js";

// ✅ 라우트 가져오기
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import directChatRoutes from "./routes/directChatRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

// ✅ ES 모듈 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 환경 변수 로드
dotenv.config();
const app = express();

// ✅ HTTP 서버 & Socket.io 설정
const server = http.createServer(app);
// ✅ Express CORS 설정
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://15.165.66.153.nip.io",
      "https://l-talk.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Socket.io CORS 설정 \
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://15.165.66.153.nip.io",
      "https://l-talk.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  console.log("🌍 요청 Origin:", req.headers.origin); // 🔥 요청의 Origin 확인
  next();
});
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
app.use("/api/friends", friendRoutes);

// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Socket.io 이벤트 핸들링
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", "hi");

  socket.on("join_room", async ({ roomId, page }) => {
    socket.join(roomId);
    console.log(`🔹 User ${socket.id} joined room: ${roomId}`);

    try {
      // 페이지에 맞게 메시지 로드
      const messagesPerPage = 20;
      const messages = await Message.find({ room: roomId })
        .skip((page - 1) * messagesPerPage) // 페이지 번호에 맞게 건너뛰기
        .limit(messagesPerPage) // 20개씩 제한
        .sort({ timestamp: -1 }) // 최신 메시지부터 정렬
        .populate("sender", "name profilePicture");

      socket.emit("load_messages", messages); // 클라이언트에 메시지 전송
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
