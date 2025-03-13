import { useEffect, useState } from "react";
import { fetchFriendsAPI, removeFriendAPI } from "../api/friend"; // ✅ 친구 목록 & 삭제 API
import { Link } from "react-router-dom";
import { UserType } from "../types/UserType";
import { IoTrash } from "react-icons/io5"; // ❌ 친구 삭제 아이콘
import messageIcon from "../assets/icons/messageIcon.png"; // DM 아이콘
import Header from "../components/Header";
const serverUrl = import.meta.env.VITE_SERVER_URL;

const FriendListPage = () => {
  const [friends, setFriends] = useState<UserType[]>([]); // 친구 목록 상태

  // ✅ 친구 목록 가져오는 함수
  const fetchFriends = async () => {
    const response = await fetchFriendsAPI();
    if (response.ok) {
      setFriends(response.friends);
    }
  };

  // ✅ 친구 삭제 함수
  const handleRemoveFriend = async (friendId: string) => {
    const confirmDelete = window.confirm("정말로 친구를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const response = await removeFriendAPI(friendId);
    if (response.ok) {
      setFriends((prevFriends) =>
        prevFriends.filter((f) => f._id !== friendId)
      ); // ✅ UI에서 즉시 삭제
      alert("친구가 삭제되었습니다.");
    } else {
      alert("친구 삭제에 실패했습니다.");
    }
  };

  // ✅ 페이지 로드 시 친구 목록 가져오기
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="flex flex-col text-white">
      <Header />

      <main className="bg-gray-900 flex-grow">
        {friends.length === 0 ? (
          <p>친구 목록이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <li
                key={friend._id}
                className="flex items-center justify-between bg-gray-800 p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`${serverUrl}${friend.profilePicture}`}
                    alt="프로필"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-lg">{friend.name}</span>
                </div>

                <div className="flex gap-2">
                  {/* DM 버튼 */}
                  <Link
                    to={`/dm/${friend._id}`}
                    className="bg-blue-500 p-2 rounded-full"
                  >
                    <img src={messageIcon} alt="DM" className="w-6 h-6" />
                  </Link>

                  {/* 친구 삭제 버튼 */}
                  <button
                    onClick={() => handleRemoveFriend(friend._id)}
                    className="bg-red-500 p-2 rounded-full cursor-pointer"
                  >
                    <IoTrash size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default FriendListPage;
