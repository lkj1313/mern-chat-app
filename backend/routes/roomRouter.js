import express from "express";
import Room from "../models/Room.js"; // Room 모델 가져오기

const router = express.Router();

// 대화방 생성 API
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    // 대화방 이름이 이미 존재하는지 확인
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: "Room already exists!" });
    }

    // 새 대화방 생성
    const newRoom = new Room({ name });
    await newRoom.save();

    res
      .status(201)
      .json({ message: "Room created successfully!", room: newRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
