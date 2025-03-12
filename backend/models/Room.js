import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // 대화방 이름
    image: {
      type: String,
      default: function () {
        return generateDefaultImage(this.name);
      }, // 기본 이미지 생성
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // 생성자
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 참여한 사용자들
    lastMessage: {
      type: String, // 마지막 메시지 내용 (간단한 미리보기용)
      default: "",
    },
    lastMessageSender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ 마지막 메시지 보낸 사람

    lastMessageAt: {
      type: Date, // 마지막 메시지 보낸 시간
      default: null,
    },
  },
  { timestamps: true } // createdAt, updatedAt 자동 생성
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
