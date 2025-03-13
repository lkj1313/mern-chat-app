import { useRef, useEffect } from "react";

interface ProfileMenuProps {
  isMenuOpen: boolean;
  closeMenu: (e: React.MouseEvent) => void;
  isFriend: boolean; // 친구 상태
  onAddFriend: (e: React.MouseEvent) => void;
  onRemoveFriend: (e: React.MouseEvent) => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isMenuOpen,
  closeMenu,
  isFriend,
  onAddFriend,
  onRemoveFriend,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu(e as unknown as React.MouseEvent);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen, closeMenu]);

  if (!isMenuOpen) return null; // 메뉴가 닫혀있으면 렌더링하지 않음

  return (
    <div
      ref={menuRef}
      className="absolute top-6 right-0 bg-gray-800 rounded-lg shadow-xl text-white py-2 w-40"
    >
      <ul>
        {isFriend ? (
          <li onClick={onRemoveFriend} className="px-4 py-2  cursor-pointer">
            친구 삭제
          </li>
        ) : (
          <li onClick={onAddFriend} className="px-4 py-2  cursor-pointer">
            친구 추가
          </li>
        )}
      </ul>
    </div>
  );
};

export default ProfileMenu;
