import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoChevronBack } from "react-icons/io5";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
const serverUrl = import.meta.env.VITE_SERVER_URL;

interface HeaderProps {
  onSearch?: (query: string) => void;
  roomInfo?: {
    _id: string;
    name: string;
    image: string;
    createdBy: { name: string };
  } | null; // ✅ 방 정보 prop 추가
}

const Header = ({ onSearch, roomInfo }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleGoBack = () => {
    if (isSearching) {
      // ✅ 검색 중이면 검색창 닫기
      setIsSearching(false);
      setSearchQuery("");
      onSearch?.(""); // ✅ 부모 컴포넌트(HomePage)에도 빈 검색어 전달
    } else {
      // ✅ 일반적인 뒤로 가기 동작
      navigate(-1);
    }
  };

  // ✅ 돋보기 클릭 시 검색창 활성화
  const handleSearchClick = () => {
    setIsSearching(true);
  };

  // ✅ 검색 입력 핸들러 (부모 컴포넌트로 검색어 전달)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query); // ✅ 부모(HomePage)로 검색어 전달
  };

  return (
    <header className="bg-gray-700 min-h-25 flex items-center justify-between px-5">
      <div className="flex items-center">
        {/* ✅ `isSearching`이 true이면 뒤로 가기 버튼 표시, 아니면 기존 버튼 */}
        {isSearching ? (
          <IoChevronBack
            size={30}
            className="cursor-pointer mr-16"
            onClick={handleGoBack} // ✅ 검색창 닫기 버튼
          />
        ) : location.pathname === "/home" ? (
          <GiHamburgerMenu
            size={30}
            className="cursor-pointer"
            onClick={toggleSidebar} // ✅ 햄버거 메뉴 클릭 이벤트
          />
        ) : (
          <IoChevronBack
            size={30}
            className="cursor-pointer mr-16"
            onClick={handleGoBack} // ✅ 일반 뒤로 가기 버튼
          />
        )}

        {location.pathname === "/create-room" ? (
          <div className="text-white flex text-[20px]">대화방 만들기</div>
        ) : (
          ""
        )}
        {id ? (
          <div
            onClick={() => navigate("roominformation")}
            className="flex items-center gap-3 text-white "
          >
            <div>
              <img
                src={`${serverUrl}${roomInfo?.image}`}
                className="w-10 h-10 rounded-full"
              ></img>
            </div>
            {roomInfo?.name}{" "}
          </div>
        ) : null}
      </div>
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
            size={30}
            className="cursor-pointer"
            onClick={handleSearchClick}
          />
        ))}

      {/* {id &&
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
            size={30}
            className="cursor-pointer"
            onClick={handleSearchClick}
          />
        ))} */}

      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;
