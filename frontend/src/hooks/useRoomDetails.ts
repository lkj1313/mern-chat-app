// hooks/useChatRoom.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoomType } from "../types/RoomType";
import { UserType } from "../types/UserType";
import { joinRoomAPI, fetchRoomDetailsAPI } from "../api/rooms";

//  채팅방 정보를 관리하는 커스텀 훅
const useRoomDetails = (roomId: string | undefined, user: UserType | null) => {
  // 방 정보를 상태로 관리
  const [room, setRoom] = useState<RoomType | null>(null);
  const navigate = useNavigate();

  //  사용자를 방에 참가시키는 함수 (API 호출)
  const joinRoom = async () => {
    if (!roomId || !user) return;

    try {
      const response = await joinRoomAPI(roomId);
      if (!response.ok) {
        navigate("/home");
        return;
      }
      setRoom(response.room);
    } catch (error) {
      console.error("🚨 방 참가 중 오류 발생:", error);
      navigate("/home");
    }
  };

  //  방 정보를 가져오고 사용자의 참여 여부를 확인하는 함수
  const fetchRoom = async () => {
    if (!roomId || !user) return;

    try {
      const response = await fetchRoomDetailsAPI(roomId);

      if (!response.ok) {
        alert("방 정보를 불러오지 못했습니다.");
        navigate("/home");
        return;
      }

      setRoom(response.data);

      //  사용자가 이미 방에 있는지 확인
      const isUserInRoom = response.data.users.some(
        (u: { _id: string }) => u._id === user._id
      );

      if (!isUserInRoom) {
        const confirmJoin = window.confirm("방에 참가하시겠습니까?");
        if (confirmJoin) {
          await joinRoom();
        } else {
          navigate("/home");
        }
      }
    } catch (error) {
      console.error("🚨 방 정보를 불러오는 중 오류 발생:", error);
      navigate("/home");
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId, user]);

  return { room, joinRoom };
};

export default useRoomDetails;
