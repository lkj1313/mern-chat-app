import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true, // ✅ 방 ID에 인덱스 추가 (조회 성능 향상)
    }, // 방 ID (참조)

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // 보낸 사람 (유저 ID)

    message: {
      type: String,
      required: true,
    }, // 메시지 내용

    timestamp: {
      type: Date,
      default: Date.now,
    }, // 메시지 보낸 시간
  },
  { timestamps: true } // ✅ createdAt, updatedAt 자동 추가
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
