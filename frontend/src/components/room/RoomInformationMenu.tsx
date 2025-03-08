import { useRef, useEffect } from "react";
import { RoomType } from "../../types/RoomType";
import { useAuth } from "../../hooks/useAuth";
import { deleteRoomApI, leaveRoomAPI } from "../../api/rooms";
import { useNavigate } from "react-router-dom";

interface RoomMenuProps {
  isMenuOpen: boolean;
  closeMenu: (e: React.MouseEvent) => void;
  room: RoomType | null;
}

const RoomMenu: React.FC<RoomMenuProps> = ({ isMenuOpen, closeMenu, room }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // 방생성자인지 아닌지 확인
  const isOwner = user?._id === room?.createdBy._id;

  // 방 삭제 핸들러
  const handleDeleteRoom = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (!room) return;

    const confirmDelete = window.confirm("정말로 방을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const response = await deleteRoomApI(room._id);
    if (response.ok) {
      alert("방이 성공적으로 삭제되었습니다.");
      navigate("/home"); // ✅ 방 삭제 후 홈 화면으로 이동
    } else {
      alert("방 삭제에 실패했습니다.");
    }
  };

  // 방 나가기 핸들러
  const handleLeaveRoom = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!room) return;

    const confirmLeave = window.confirm("정말로 방을 나가시겠습니까?");
    if (!confirmLeave) return;

    const response = await leaveRoomAPI(room._id);
    if (response.ok) {
      alert("방을 나갔습니다.");
      navigate("/home"); // ✅ 나간 후 홈으로 이동
    } else {
      alert("방 나가기에 실패했습니다.");
    }
  };
  // 메뉴 외부 클릭 시 닫기 처리
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu(e as unknown as React.MouseEvent);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [closeMenu]);

  if (!isMenuOpen) return null; // 메뉴가 닫혀있으면 렌더링하지 않음

  return (
    <div
      ref={menuRef}
      className="absolute top-6 right-2 bg-gray-800 rounded-lg shadow-xl text-white py-2"
    >
      {isOwner ? (
        // 방장 메뉴
        <ul>
          <li onClick={handleDeleteRoom} className="px-4 py-2  cursor-pointer">
            방 삭제
          </li>
        </ul>
      ) : (
        // 일반 유저 메뉴
        <ul>
          <li onClick={handleLeaveRoom} className="px-4 py-2  cursor-pointer">
            방 나가기
          </li>
        </ul>
      )}
    </div>
  );
};

export default RoomMenu;
