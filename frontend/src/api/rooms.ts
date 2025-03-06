// api/rooms.ts
const serverUrl = import.meta.env.VITE_SERVER_URL;

export const fetchRoomDetails = async (roomId: string) => {
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
