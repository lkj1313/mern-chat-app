import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { fetchAllChatRooms, fetchAllChatsAPI } from "../api/rooms";
import { UserType } from "../types/UserType";

interface RoomType {
  _id: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageSender: string;
  lastMessageAt: string;
  type: string;
  users?: UserType[];
  directChatPartnerId?: string;
}
const HomePage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [joinRooms, setJoinRooms] = useState<RoomType[]>([]);
  const [allRooms, setAllRooms] = useState<RoomType[]>([]);

  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]); // ✅ 상태 타입 추가

  const navigate = useNavigate();
  function formatLastMessageTime(dateString: string | null) {
    if (!dateString) return ""; // ✅ 빈 값이면 아무것도 반환

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("❌ 잘못된 날짜 값:", dateString); // ❗️유효하지 않은 날짜 확인
      return "";
    }

    if (isToday(date)) {
      return format(date, "a hh:mm", { locale: ko }); // 오늘이면 '오전 08:30'
    } else {
      return format(date, "M월 d일", { locale: ko }); // 오늘이 아니면 '3월 8일'
    }
  }

  useEffect(() => {
    const loadChats = async () => {
      // 1. 모든 채팅방 가져오기
      const { ok: allChatsOk, rooms: allChats } = await fetchAllChatsAPI();
      // 2. 일반 채팅방 가져오기
      const { ok: chatRoomsOk, rooms: chatRooms } = await fetchAllChatRooms();

      // 두 데이터를 합침
      if (allChatsOk && chatRoomsOk) {
        setAllRooms(chatRooms); // 모든 채팅방을 합친 목록
        setJoinRooms(allChats); // 사용자가 참여한 일반 채팅방 목록
      } else {
        console.error("❌ 채팅 목록 불러오기 실패");
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    setFilteredRooms(joinRooms); // ✅ rooms가 업데이트되면 filteredRooms도 업데이트
  }, [joinRooms]);

  // 검색 기능
  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRooms(joinRooms); // 검색어가 없으면 전체 목록 표시
      return;
    }

    // **모든 채팅방**을 기준으로 검색하기
    const filtered = allRooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredRooms(filtered); // 검색된 방 목록으로 상태 업데이트
  };
  return (
    <div className="relative overflow-hidden">
      <Header onSearch={handleSearch} />
      <div className="p-5 bg-gray-800 min-h-screen text-white">
        <div className="flex flex-col gap-10">
          {filteredRooms.map((room) => {
            return (
              <div
                key={room._id}
                onClick={
                  () =>
                    room.type === "direct"
                      ? navigate(`/dm/${room.directChatPartnerId}`) // ✅ 1:1 채팅이면 상대방 ID로 이동
                      : navigate(`/room/${room._id}`) // ✅ 그룹 채팅이면 기존 방식 유지
                }
                className="w-full flex gap-5 cursor-pointer hover:bg-gray-600 p-1 rounded group"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={
                      room.image.startsWith("/uploads/")
                        ? `${serverUrl}${room.image}` // ✅ 상대 경로면 서버 URL 붙이기
                        : room.image // ✅ 이미 절대 URL이면 그대로 사용
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
