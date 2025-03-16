import mongoose from "mongoose";

const directChatSchema = new mongoose.Schema(
  {
    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now }, // ✅ 기본값을 현재 시간으로 설정
    type: { type: String, default: "direct" }, // 항상 그룹 채팅
  },
  { timestamps: true }
);

const DirectChat = mongoose.model("DirectChat", directChatSchema);
export default DirectChat;
