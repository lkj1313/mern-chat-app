import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, default: "" }, // ✅ 텍스트 메시지 (선택적)
  imageUrl: { type: String, default: null }, // ✅ 이미지 메시지 (선택적)
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);
export default Message;
