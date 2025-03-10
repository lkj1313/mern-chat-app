import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { fetchAllChatsAPI } from "../api/rooms";

interface RoomType {
  _id: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageSender: string;
  lastMessageAt: string;
}
const HomePage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
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
    const loadChats = async () => {
      const { ok, rooms } = await fetchAllChatsAPI();
      if (ok) {
        setRooms(rooms);
      } else {
        console.error("❌ 채팅 목록 불러오기 실패");
      }
    };

    loadChats();
  }, []);
  console.log(rooms);
  useEffect(() => {
    setFilteredRooms(rooms); // ✅ rooms가 업데이트되면 filteredRooms도 업데이트
  }, [rooms]);

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
                  src={
                    room.image.startsWith("http")
                      ? room.image
                      : `${serverUrl}${room.image}`
                  }
                  className="rounded-full w-full h-full"
                  alt={room.name}
                />
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
