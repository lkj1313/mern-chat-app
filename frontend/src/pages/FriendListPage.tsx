import FriendItem from "../components/friend/FriendItem";
import Header from "../components/Header";

import { useFetchFriends } from "../hooks/useFetchFriends";

const FriendListPage = () => {
  const { friends, setFriends } = useFetchFriends();

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prevFriends) => prevFriends.filter((f) => f._id !== friendId));
  };

  return (
    <div className="flex flex-col text-white">
      <Header />

      <main className="bg-gray-900 flex-grow p-5">
        {friends.length === 0 ? (
          <p className="text-center text-gray-400">친구 목록이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <FriendItem
                key={friend._id}
                friend={friend}
                onRemove={handleRemoveFriend}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default FriendListPage;
