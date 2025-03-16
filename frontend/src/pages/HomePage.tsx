import Header from "../components/Header";

import { useFetchRooms } from "../hooks/useFetchRoom";
import { useSearchRooms } from "../hooks/useSearchRooms";

import RoomList from "../components/room/RoomList";
import { RoomType } from "../types/RoomType";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  // 채팅방 데이터 로딩
  const { joinRooms, allRooms } = useFetchRooms();

  // 검색 기능
  const { filteredRooms, handleSearch } = useSearchRooms(allRooms, joinRooms);
  const handleRoomClick = (room: RoomType) => {
    if (room.type === "direct") {
      navigate(`/dm/${room.directChatPartnerId}`);
    } else {
      navigate(`/room/${room._id}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Header onSearch={handleSearch} />
      <div className="p-5 bg-gray-800 min-h-[calc(100vh-100px)] overflow-y-auto text-white">
        <RoomList rooms={filteredRooms} onRoomClick={handleRoomClick} />
      </div>
    </div>
  );
};

export default HomePage;
