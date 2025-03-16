import { RoomType } from "../../types/RoomType";
import { formatLastMessageTime } from "../../utils/dateUtils";

interface RoomItemProps {
  room: RoomType;
  onClick: () => void;
}

const RoomItem = ({ room, onClick }: RoomItemProps) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  return (
    <div
      onClick={onClick}
      className="w-full flex gap-5 cursor-pointer hover:bg-gray-600 p-1 rounded group"
    >
      <div className="w-16 h-16 flex-shrink-0">
        <img
          src={
            room.image.startsWith("/uploads/")
              ? `${serverUrl}${room.image}`
              : room.image
          }
          className="rounded-full w-full h-full"
          alt={room.name}
        />
      </div>
      <div className="p-1 flex-grow border-b border-b-black group-hover:border-b-0">
        <div className="flex justify-between">
          <div>{room.name}</div>
          <div className="text-gray-500 text-[13px]">
            {formatLastMessageTime(room.lastMessageAt)}
          </div>
        </div>
        <div className="max-w-[300px] overflow-hidden text-gray-500 text-[15px] whitespace-nowrap text-ellipsis">
          {room.lastMessage && (
            <>
              <span>{room.lastMessageSender}: </span>
              <span>{room.lastMessage}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomItem;
