import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaEllipsisVertical } from "react-icons/fa6";
import { RoomType } from "../types/RoomType";

import { fetchRoomDetails } from "../api/rooms";
import RoomInformationMenu from "../components/room/RoomInformationMenu";

const RoomInformationPage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);

  console.log("room", room);

  // 메뉴 열림 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 뒤로가기 함수
  const handleGoBack = () => navigate(-1);

  //메뉴 열기 함수
  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };
  const closeMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };
  //채팅룸 정보 불러오기
  useEffect(() => {
    const loadRoomDetail = async () => {
      const response = await fetchRoomDetails(id!);
      if (response.ok) {
        setRoom(response.data);
      } else {
        console.log("방 정보 불러오기 실패");
      }
    };
    loadRoomDetail();
  }, [id]);

  return (
    <div>
      <header className=" bg-gray-700 flex flex-col relative  p-5 gap-5">
        <div className="flex justify-between items-center ">
          <IoChevronBack
            onClick={handleGoBack}
            size={30}
            className="cursor-pointer mr-16"
          />
          <FaEllipsisVertical
            size={20}
            onClick={openMenu}
            className="cursor-pointer"
          />
        </div>
        <div>
          <div className="flex gap-5">
            <img
              className="w-20 h-20 rounded-full"
              src={`${serverUrl}${room?.image}`}
            ></img>
            <div>{room?.name}</div>
          </div>
        </div>
        <RoomInformationMenu
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
          room={room}
        />
      </header>
    </div>
  );
};

export default RoomInformationPage;
