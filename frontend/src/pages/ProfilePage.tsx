import { Link, useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { fetchUserInfoAPI } from "../api/user";
import { UserType } from "../types/UserType";
import messageIcon from "../assets/icons/messageIcon.png";

import ProfileMenu from "../components/room/ProfileMenu";
import { addFriendAPI, checkFriendAPI, removeFriendAPI } from "../api/friend";
const ProfilePage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림 상태
  const [isFriend, setIsFriend] = useState(false); // 친구 상태
  //메뉴 열기 함수
  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };
  //메뉴 닫기 함수
  const closeMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  //뒤로가기 함수
  const handleGoBack = () => navigate(-1);

  // ✅ 친구 상태 확인 함수 (백엔드에서 가져오기)
  const checkFriendStatus = async () => {
    if (!id) return;
    const response = await checkFriendAPI(id);
    if (response.ok) {
      setIsFriend(response.isFriend);
    }
  };
  // ✅ 친구 추가 함수
  const handleAddFriend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;

    const response = await addFriendAPI(id);
    if (response.ok) {
      alert("친구가 추가되었습니다!");
      await checkFriendStatus();
    } else {
      alert(response.message);
    }
  };
  //  친구 삭제 함수
  const handleRemoveFriend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;

    const response = await removeFriendAPI(id);
    if (response.ok) {
      alert("친구가 삭제되었습니다!");
      await checkFriendStatus();
    } else {
      alert(response.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      const { ok, user } = await fetchUserInfoAPI(id);
      if (ok) {
        setUser(user);
      } else {
        console.log("유저 정보를 가져오는데 실패함");
      }
    };
    fetchUser();
    checkFriendStatus();
  }, [id]);

  return (
    <div className="bg-gray-900">
      <header className=" bg-gray-700 flex flex-col p-5  gap-5 relative">
        <div className="flex justify-between items-center ">
          <IoChevronBack
            onClick={handleGoBack}
            size={30}
            color="white"
            className="cursor-pointer mr-16"
          />
          {/* :버튼 */}
          <FaEllipsisVertical
            color="white"
            size={20}
            onClick={openMenu}
            className="cursor-pointer"
          />
        </div>
        <ProfileMenu
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
          onAddFriend={handleAddFriend}
          onRemoveFriend={handleRemoveFriend}
          isFriend={isFriend}
        />

        <div>
          <div className="flex gap-5 items-center">
            <img
              className="w-20 h-20 rounded-full"
              src={`${serverUrl}${user?.profilePicture}`}
            ></img>
            <div className="flex flex-col justify-center">
              <span className="text-white text-[30px] ">
                <strong>{user?.name}</strong>
              </span>
            </div>
          </div>
        </div>
        <Link to={`/dm/${user?._id}`}>
          <div className="w-15 h-15 flex items-center justify-center  absolute -bottom-8 right-2 rounded-full bg-blue-300">
            <img className="w-10 h-10" src={messageIcon}></img>
          </div>
        </Link>
      </header>

      <main className="bg-gray-800 p-5">
        <h2 className="text-blue-400">
          <strong>정보</strong>
        </h2>
        <div>
          <div className="text-white">{user?.email}</div>
          <div className="text-gray-400 text-[10px]">이메일</div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
