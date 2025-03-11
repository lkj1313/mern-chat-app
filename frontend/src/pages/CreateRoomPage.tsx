import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AiOutlinePicture } from "react-icons/ai";
import InputField from "../components/InputField";
const serverUrl = import.meta.env.VITE_SERVER_URL;

const CreateRoomPage = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [roomImage, setRoomImage] = useState<File | null>(null); // ✅ `File` 객체로 저장

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRoomImage(e.target.files[0]); // ✅ File 객체 저장
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("대화방 이름을 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const formData = new FormData(); // ✅ FormData 객체 생성
      formData.append("name", roomName); // ✅ 대화방 이름 추가
      if (roomImage) {
        formData.append("roomImage", roomImage); // ✅ 이미지 파일 추가
      }

      const response = await fetch(`${serverUrl}/api/rooms/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ JWT 토큰 추가
        },
        body: formData, // ✅ FormData 전송
      });

      const data = await response.json();

      if (response.ok) {
        alert("대화방이 생성되었습니다!");
        navigate(`/room/${data.room._id}`);
      } else {
        alert("대화방 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("대화방 생성 실패:", error);
      alert("서버 오류");
    }
  };

  return (
    <div className="overflow-hidden">
      <Header />
      <main className="bg-gray-800 h-full p-5">
        <div className="flex w-full">
          <label htmlFor="room-image-upload" className="cursor-pointer">
            <input
              id="room-image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange} // 핸들러 함수 사용
            />
            {roomImage ? (
              <img
                src={URL.createObjectURL(roomImage)}
                alt="Room Preview"
                className="w-16 h-16 rounded-full border mr-4"
              />
            ) : (
              <AiOutlinePicture className="w-16 h-16 bg-white border rounded-full mr-4" />
            )}
          </label>
          <div className="flex-grow">
            <InputField
              placeholder="대화방명"
              value={roomName}
              onChange={(value) => setRoomName(value)} // 입력 값 변경 시 상태 업데이트
              width="w-full"
            />
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button
            onClick={handleCreateRoom}
            className="bg-white text-gray-800 px-4 py-2 rounded-md cursor-pointer"
          >
            만들기
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreateRoomPage;
