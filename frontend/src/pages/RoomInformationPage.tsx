import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
interface RoomType {
  _id: string;
  name: string;
  image: string;
  createdBy: { name: string; email: string }; // ✅ 방장 정보
  users: { name: string; email: string }[]; // ✅ 참여자 목록
}
const RoomInformationPage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const handleGoBack = () => navigate(-1);
  console.log(room);
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(`http://localhost:5005/api/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRoom(data);
        } else {
          alert("방 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };

    fetchRoomDetails();
  }, [id]);

  return (
    <div>
      <header className=" bg-gray-700 flex flex-col  p-5 gap-5">
        <IoChevronBack
          onClick={handleGoBack}
          size={30}
          className="cursor-pointer mr-16"
        />
        <div>
          <div className="flex gap-5">
            <img
              className="w-20 h-20 rounded-full"
              src={`${serverUrl}${room?.image}`}
            ></img>
            <div>{room?.name}</div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default RoomInformationPage;
