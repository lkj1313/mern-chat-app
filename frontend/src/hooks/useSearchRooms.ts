// hooks/useSearchRooms.ts
import { useState, useEffect } from "react";
import { RoomType } from "../types/RoomType";

export const useSearchRooms = (allRooms: RoomType[], joinRooms: RoomType[]) => {
  const [filteredRooms, setFilteredRooms] = useState<RoomType[]>([]);

  useEffect(() => {
    setFilteredRooms(joinRooms); // rooms가 업데이트되면 filteredRooms도 업데이트
  }, [joinRooms]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRooms(joinRooms); // 검색어가 없으면 전체 목록 표시
      return;
    }

    // **모든 채팅방**을 기준으로 검색하기
    const filtered = allRooms.filter((room) =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredRooms(filtered); // 검색된 방 목록으로 상태 업데이트
  };

  return { filteredRooms, handleSearch };
};
