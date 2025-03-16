import { RoomType } from "../../types/RoomType";
import RoomItem from "./RoomItem";

interface RoomListProps {
  rooms: RoomType[];
  onRoomClick: (room: RoomType) => void;
}

const RoomList = ({ rooms, onRoomClick }: RoomListProps) => {
  return (
    <div className="flex flex-col gap-10 max-h-[calc(100vh-300px)]">
      {rooms.map((room) => (
        <RoomItem
          key={room._id}
          room={room}
          onClick={() => onRoomClick(room)} // `room` 데이터 전달
        />
      ))}
    </div>
  );
};

export default RoomList;
