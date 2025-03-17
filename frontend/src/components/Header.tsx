import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoChevronBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
const serverUrl = import.meta.env.VITE_SERVER_URL;

interface HeaderProps {
  onSearch?: (query: string) => void;
  roomInfo?: {
    _id: string;
    name: string;
    image: string;
    createdBy?: { name: string }; // ✅ 1:1 채팅에서는 방장이 없을 수 있음
    users: { _id: string; name: string; email: string }[];
    type?: string;
  } | null;
}

const Header = ({ onSearch, roomInfo }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleGoBack = () => {
    if (isSearching) {
      setIsSearching(false);
      setSearchQuery("");
      onSearch?.("");
    } else {
      navigate(-1);
    }
  };

  const handleSearchClick = () => setIsSearching(true);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="bg-gray-700 min-h-25 flex items-center justify-between px-5 rounded-t-[8px]">
      <div className="flex items-center">
        {/* ✅ 뒤로가기 버튼 */}
        {isSearching ? (
          <IoChevronBack
            size={30}
            className="cursor-pointer mr-16"
            color="white"
            onClick={handleGoBack}
          />
        ) : location.pathname === "/home" ? (
          <GiHamburgerMenu
            size={30}
            className="cursor-pointer"
            color="white"
            onClick={toggleSidebar}
          />
        ) : (
          <IoChevronBack
            size={30}
            color="white"
            className="cursor-pointer mr-16"
            onClick={handleGoBack}
          />
        )}

        {/* ✅ 방 이름과 이미지 (1:1 채팅 & 그룹 채팅 모두 지원) */}
        {roomInfo ? (
          <div className="flex items-center gap-3 text-white">
            <div>
              <img
                onClick={() =>
                  roomInfo.type === "direct" && roomInfo.users?.length > 0
                    ? navigate(
                        `/profile/${
                          roomInfo.users.find(
                            (user) => user._id !== currentUser?._id
                          )?._id
                        }`
                      )
                    : navigate("roominformation")
                }
                src={`${serverUrl}${roomInfo.image}`}
                className="w-15 h-15 rounded-full cursor-pointer"
                alt={roomInfo.name}
              />
            </div>
            <div>
              <div>{roomInfo.name}</div>
              {roomInfo.users.length > 1 && ( // ✅ 그룹 채팅인 경우만 표시
                <div className="text-gray-400 text-[11px]">
                  참가자: {roomInfo.users.length}명
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* ✅ 검색 기능 */}
      {location.pathname === "/home" &&
        (isSearching ? (
          <input
            type="text"
            placeholder="대화방 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-gray-600 text-white px-3 py-1 rounded-lg focus:outline-none"
          />
        ) : (
          <HiOutlineMagnifyingGlass
            color="white"
            size={30}
            className="cursor-pointer"
            onClick={handleSearchClick}
          />
        ))}

      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;
