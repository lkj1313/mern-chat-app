import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "/uploads/default-avatar.png" }, // ✅ 프로필 사진 필드 추가 (URL 저장)
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
