import { Link } from "react-router-dom";
import { IoTrash } from "react-icons/io5";
import messageIcon from "../../assets/icons/messageIcon.png";
import { removeFriendAPI } from "../../api/friend";
import { UserType } from "../../types/UserType";

const serverUrl = import.meta.env.VITE_SERVER_URL;

interface FriendItemProps {
  friend: UserType;
  onRemove: (friendId: string) => void;
}

const FriendItem = ({ friend, onRemove }: FriendItemProps) => {
  const handleRemoveFriend = async () => {
    const confirmDelete = window.confirm("정말로 친구를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const response = await removeFriendAPI(friend._id);
    if (response.ok) {
      onRemove(friend._id);
      alert("친구가 삭제되었습니다.");
    } else {
      alert("친구 삭제에 실패했습니다.");
    }
  };

  return (
    <li className="flex items-center justify-between bg-gray-800 p-4">
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
        <Link to={`/dm/${friend._id}`} className="bg-blue-500 p-2 rounded-full">
          <img src={messageIcon} alt="DM" className="w-6 h-6" />
        </Link>

        {/* 친구 삭제 버튼 */}
        <button
          onClick={handleRemoveFriend}
          className="bg-red-500 p-2 rounded-full cursor-pointer"
        >
          <IoTrash size={20} />
        </button>
      </div>
    </li>
  );
};

export default FriendItem;
