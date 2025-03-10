import mongoose from "mongoose";

const directChatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // ✅ 1:1 채팅이므로 두 명 필수
      },
    ],
    lastMessage: {
      type: String, // ✅ 마지막 메시지 (미리보기용)
      default: "",
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ 마지막 메시지를 보낸 사람
    },
    lastMessageAt: {
      type: Date, // ✅ 마지막 메시지 시간
      default: null,
    },
  },
  { timestamps: true } // ✅ createdAt, updatedAt 자동 생성
);

const DirectChat = mongoose.model("DirectChat", directChatSchema);
export default DirectChat;
