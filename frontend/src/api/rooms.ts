// api/rooms.ts
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const fetchRoomDetailsAPI = async (roomId: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${serverUrl}/api/rooms/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

export const joinRoomAPI = async (roomId: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${serverUrl}/api/rooms/${roomId}/join`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, room: data.room };
};

export const deleteRoomApI = async (roomId: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${serverUrl}/api/rooms/${roomId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, room: data.room };
};
//방 나가는 API
export const leaveRoomAPI = async (roomId: string) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${serverUrl}/api/rooms/${roomId}/leave`, {
    method: "PUT", //방 나가기 요청 (PUT)
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, message: data.message };
};
/// 채팅방의 이미지 가져오는 API
export const fetchRoomImageAPI = async (roomId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${serverUrl}/api/rooms/${roomId}/image`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, image: data };
};
