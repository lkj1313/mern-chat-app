import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Friend = mongoose.model("Friend", FriendSchema);
export default Friend;
