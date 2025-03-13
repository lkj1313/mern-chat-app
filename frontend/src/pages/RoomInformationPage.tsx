import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaEllipsisVertical } from "react-icons/fa6";
import { RoomType } from "../types/RoomType";

import { fetchRoomDetailsAPI, fetchRoomImageAPI } from "../api/rooms";
import RoomInformationMenu from "../components/room/RoomMenu";

const RoomInformationPage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [images, setImages] = useState<
    {
      _id: string;
      imageUrl: string;
      sender: { _id: string; name: string; profilePicture: string };
    }[]
  >([]);

  const [activeTab, setActiveTab] = useState("참가자");

  // 뒤로가기 함수
  const handleGoBack = () => navigate(-1);

  // 메뉴 열림 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      const response = await fetchRoomDetailsAPI(id!);
      if (response.ok) {
        setRoom(response.data);
      } else {
        console.log("방 정보 불러오기 실패");
      }
    };
    loadRoomDetail();
  }, [id]);
  useEffect(() => {
    const loadRoomImg = async () => {
      const response = await fetchRoomImageAPI(id!);

      if (response.ok) {
        setImages(response.image); // ✅ images로 변경
        console.log("📌 불러온 이미지 데이터:", response.image);
      } else {
        console.error("❌ 이미지 데이터를 불러오지 못했습니다.");
      }
    };

    loadRoomImg();
  }, [id]);

  return (
    <div className="bg-gray-900">
      <header className=" bg-gray-700 flex flex-col relative  p-5 gap-5 mb-3">
        <div className="flex justify-between items-center ">
          <IoChevronBack
            onClick={handleGoBack}
            size={30}
            color="white"
            className="cursor-pointer mr-16"
          />
          <FaEllipsisVertical
            color="white"
            size={20}
            onClick={openMenu}
            className="cursor-pointer"
          />
        </div>
        <div>
          <div className="flex gap-5 items-center">
            <img
              className="w-20 h-20 rounded-full"
              src={`${serverUrl}${room?.image}`}
            ></img>
            <div className="flex flex-col justify-center">
              <span className="text-white text-[20px] ">
                <strong>{room?.name}</strong>
              </span>
              <span className="text-gray-400 text-[10px]">
                참가자 : {room?.users.length}명
              </span>
            </div>
          </div>
        </div>
        <RoomInformationMenu
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
          room={room}
        />
      </header>
      <div className="flex h-10 bg-gray-700 mb-1">
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer transition  duration-500 ${
            activeTab === "참가자"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-white hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("참가자")}
        >
          <strong>참가자</strong>
        </div>
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer transition duration-500 ${
            activeTab === "미디어"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-white hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("미디어")}
        >
          <strong>미디어</strong>
        </div>
      </div>
      <div>
        {activeTab === "참가자" ? (
          room?.users.map((user) => {
            return (
              <Link to={`/profile/${user._id}`}>
                <div className="w-full flex gap-5 cursor-pointer hover:bg-gray-600 p-2 rounded group">
                  {/* 프로필 이미지 */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={`${serverUrl}${user.profilePicture}`}
                      className="rounded-full w-full h-full"
                      alt="profile"
                    />
                  </div>

                  <div className="p-1 flex-grow border-b border-b-black group-hover:border-b-0">
                    {/* 닉네임 */}
                    <div className="text-white font-medium">{user.name}</div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="grid grid-cols-5 ">
            {images.map((img) => (
              <div
                key={img._id}
                className="w-full flex justify-center p-2 rounded group"
              >
                {/* 이미지 */}
                <div className="w-full h-full flex-shrink-0">
                  <img
                    src={`${serverUrl}${img.imageUrl}`}
                    className="rounded-lg w-full h-full object-cover"
                    alt="media"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomInformationPage;
