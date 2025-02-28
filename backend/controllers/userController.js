import multer from "multer";
import path from "path";
import User from "../models/User.js"; // User 모델 가져오기

// Multer 설정: 파일을 'uploads/' 폴더에 저장
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일이 저장될 폴더
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름에 타임스탬프 추가
  },
});

const upload = multer({ storage });

// 프로필 이미지 업로드 처리 함수
const uploadProfilePicture = upload.single("image"); // 'image' 필드로 하나의 파일 업로드

// 프로필 사진 업로드 후 경로를 데이터베이스에 저장
const uploadProfilePictureHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  const filePath = `/uploads/${req.file.filename}`;

  // 클라이언트로부터 받은 이메일을 사용하여 유저 찾기
  try {
    const user = await User.findOneAndUpdate(
      { email: req.body.email }, // email로 사용자 찾기
      { profilePicture: filePath }, // 데이터베이스에 저장할 경로
      { new: true } // 업데이트된 유저 객체 반환
    );

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 성공적으로 프로필 사진을 업데이트하면 새로운 데이터 반환
    res.status(200).json({
      message: "프로필 사진이 업데이트되었습니다.",
      profilePicture: user.profilePicture, // 새로운 프로필 사진 경로 반환
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러 발생" });
  }
};

export { uploadProfilePicture, uploadProfilePictureHandler };
