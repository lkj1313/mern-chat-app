import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // 대화방 이름
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 참여한 사용자들
    messages: [
      {
        // 메시지들
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
); // createdAt, updatedAt 자동 생성

const Room = mongoose.model("Room", roomSchema);

export default Room;
