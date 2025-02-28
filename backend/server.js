import express from "express";
import http from "http"; // http 서버 모듈 추가
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // ES Module에서 __dirname 해결
import { Server } from "socket.io"; // Socket.IO의 ES 모듈 형식으로 import
import Room from "./models/Room.js"; // Room 모델 가져오기

// __dirname 생성 (ES Module 호환)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

// HTTP 서버와 Socket.IO 설정
const server = http.createServer(app); // Express 서버를 http 서버로 감쌈
const io = new Server(server); // Socket.IO와 HTTP 서버 연결

app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("📡 MongoDB Connected"))
  .catch((err) => console.log(err));

// 클라이언트가 연결되었을 때
io.on("connection", (socket) => {
  console.log("A user connected");

  // 대화방에 참여하기
  socket.on("join_room", async (roomName) => {
    try {
      // 대화방이 존재하는지 확인
      const room = await Room.findOne({ name: roomName });
      if (!room) {
        socket.emit("message", "Room does not exist!");
        return;
      }

      // 대화방에 사용자 추가
      socket.join(roomName);
      console.log(`User joined room: ${roomName}`);

      // 대화방의 기존 메시지들 보내기
      socket.emit("receive_messages", room.messages);
    } catch (error) {
      console.error(error);
      socket.emit("message", "Error joining room");
    }
  });

  // 메시지 보내기
  socket.on("send_message", async (data) => {
    const { roomName, message, userId } = data;

    try {
      const room = await Room.findOne({ name: roomName });
      if (!room) return;

      // 메시지 저장
      room.messages.push({
        sender: userId,
        message,
      });

      await room.save();

      // 대화방의 모든 사용자에게 메시지 전송
      io.to(roomName).emit("receive_message", { sender: userId, message });
    } catch (error) {
      console.error(error);
    }
  });

  // 사용자가 연결을 끊었을 때
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// 서버 실행
const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
