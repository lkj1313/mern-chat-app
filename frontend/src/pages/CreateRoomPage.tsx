import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AiOutlinePicture } from "react-icons/ai";
import InputField from "../components/InputField";

const CreateRoomPage = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert("대화방 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5005/api/auth/create-room",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: roomName }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("대화방이 생성되었습니다!");
        navigate(`/room/${data.room._id}`); // 대화방 페이지로 이동
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
          <AiOutlinePicture className="w-16 h-16 bg-white border rounded-full mr-4" />
          <div className="flex-grow">
            <InputField
              placeholder="대화방명"
              value={roomName}
              onChange={(value) => setRoomName(value)} // 입력 값 변경 시 상태 업데이트
              width="w-full" // 기본적으로 전체 너비를 가질 수 있도록
              // 나머지 공간을 차지하도록 설정
            />
          </div>
        </div>
        <button>aa</button>
      </main>
    </div>
  );
};

export default CreateRoomPage;
