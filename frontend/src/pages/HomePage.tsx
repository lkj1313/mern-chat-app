import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";

interface RoomType {
  _id: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageSender: string;
  lastMessageAt: string;
}
const HomePage = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]); // ✅ 상태 타입 추가

  const navigate = useNavigate();
  function formatLastMessageTime(dateString: string) {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, "a hh:mm", { locale: ko }); // 오늘이면 '오전 08:30'
    } else {
      return format(date, "M월 d일", { locale: ko }); // 오늘이 아니면 '3월 8일'
    }
  }
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5005/api/rooms", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ JWT 토큰 포함
          },
        });

        const data = await response.json();
        console.log("🔹 대화방 목록:", data); // ✅ 콘솔에서 응답 확인

        if (response.ok) {
          setRooms(data);
          setFilteredRooms(data); // ✅ 대화방 목록 상태 업데이트
        } else {
          alert(data.message || "대화방 목록을 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("대화방 목록 불러오기 실패:", error);
      }
    };

    fetchRooms();
  }, [navigate]);

  // ✅ 검색어를 받아 필터링
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRooms(rooms); // 검색어가 없으면 전체 목록 표시
      return;
    }

    const filtered = rooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRooms(filtered);
  };

  return (
    <div className="relative overflow-hidden">
      <Header onSearch={handleSearch} />
      <div className="p-5 bg-gray-800 min-h-screen text-white">
        <div className="flex flex-col gap-10">
          {filteredRooms.map((room) => (
            <div
              onClick={() => navigate(`/room/${room._id}`)}
              className="w-full flex gap-5 cursor-pointer hover:bg-gray-600 p-1 rounded group"
            >
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src={room.image}
                  className="rounded-full w-full h-full"
                ></img>
              </div>
              <div className="p-1 flex-grow border-b border-b-black group-hover:border-b-0">
                <div className="flex justify-between">
                  <div>{room.name}</div>
                  <div className="text-gray-500 text-[13px] ">
                    {formatLastMessageTime(room.lastMessageAt)}
                  </div>
                </div>

                <div>
                  <div className="max-w-[300px] overflow-hidden text-gray-500 text-[15px] whitespace-nowrap text-ellipsis">
                    {room.lastMessage && (
                      <>
                        <span>{room.lastMessageSender}: </span>
                        <span>{room.lastMessage}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
