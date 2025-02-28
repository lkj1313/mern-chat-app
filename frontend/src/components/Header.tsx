import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoChevronBack } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // 현재 경로를 가져오기 위해 사용
  const navigate = useNavigate(); // 뒤로 가기 버튼에 사용할 navigate
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleGoBack = () => {
    navigate(-1); // 뒤로 가기 버튼 클릭 시, 이전 페이지로 돌아가기
  };

  return (
    <header className="bg-gray-700 h-20 flex items-center justify-between px-5">
      <div className="flex">
        {/* 조건부 렌더링: /home일 때는 햄버거 메뉴, 아니면 뒤로 가기 버튼 */}
        {location.pathname === "/home" ? (
          <GiHamburgerMenu
            size={30}
            className="cursor-pointer"
            onClick={toggleSidebar} // 햄버거 메뉴 클릭 이벤트
          />
        ) : (
          <IoChevronBack
            size={30}
            className="cursor-pointer mr-16"
            onClick={handleGoBack} // 뒤로 가기 버튼 클릭 이벤트
          />
        )}
        {location.pathname === "/create-room" ? (
          <div className="text-white flex  text-[20px]">대화방 만들기</div>
        ) : (
          ""
        )}
      </div>
      <HiOutlineMagnifyingGlass size={30} className="cursor-pointer" />
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;
