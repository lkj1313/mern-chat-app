import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

import { useState } from "react";
import Sidebar from "./Sidebar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <header className="bg-gray-700 h-20 flex items-center justify-between px-5">
      <div className="flex">
        <GiHamburgerMenu
          size={30}
          className="cursor-pointer"
          onClick={toggleSidebar} // ✅ 클릭 이벤트 추가
        />
      </div>
      <HiOutlineMagnifyingGlass size={30} className="cursor-pointer" />
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;
