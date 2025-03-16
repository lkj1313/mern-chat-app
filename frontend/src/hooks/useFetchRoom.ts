import { useState, useEffect } from "react";
import { fetchAllChatRooms, fetchAllChatsAPI } from "../api/rooms";
import { RoomType } from "../types/RoomType";

export const useFetchRooms = () => {
  const [joinRooms, setJoinRooms] = useState<RoomType[]>([]);
  const [allRooms, setAllRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    const loadChats = async () => {
      // 1. 모든 채팅방 가져오기
      const { ok: allChatsOk, rooms: allChats } = await fetchAllChatsAPI();
      // 2. 일반 채팅방 가져오기
      const { ok: chatRoomsOk, rooms: chatRooms } = await fetchAllChatRooms();
      // 두 데이터를 합침
      if (allChatsOk && chatRoomsOk) {
        setAllRooms(chatRooms);
        setJoinRooms(allChats);
      } else {
        console.error("❌ 채팅 목록 불러오기 실패");
      }
    };

    loadChats();
  }, []);

  return { joinRooms, allRooms };
};
