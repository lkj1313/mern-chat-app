const SERVER_URL = import.meta.env.VITE_SERVER_URL; // 환경변수에서 백엔드 서버 주소 가져오기

// ✅ 친구 추가 API
export const addFriendAPI = async (friendId: string) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/friends/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, //  JWT 토큰 추가
      },
      body: JSON.stringify({ friendId }),
    });

    const data = await response.json();
    return { ok: response.ok, ...data };
  } catch (error) {
    console.error("친구 추가 실패:", error);
    return { ok: false, message: "친구 추가 요청 실패" };
  }
};

// ✅ 친구 삭제 API
export const removeFriendAPI = async (friendId: string) => {
  try {
    const response = await fetch(
      `${SERVER_URL}/api/friends/remove/${friendId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, //  JWT 토큰 추가
        },
      }
    );

    const data = await response.json();
    return { ok: response.ok, ...data };
  } catch (error) {
    console.error("친구 삭제 실패:", error);
    return { ok: false, message: "친구 삭제 요청 실패" };
  }
};

// ✅ 내 친구 목록 가져오기 API
export const fetchFriendsAPI = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/friends`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, //
      },
    });

    const data = await response.json();
    return { ok: response.ok, friends: data.friends || [] };
  } catch (error) {
    console.error("친구 목록 가져오기 실패:", error);
    return { ok: false, friends: [] };
  }
};

// ✅ 특정 유저가 친구인지 확인 API
export const checkFriendAPI = async (friendId: string) => {
  try {
    const response = await fetch(
      `${SERVER_URL}/api/friends/check/${friendId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT 토큰 추가
        },
      }
    );

    const data = await response.json();
    return { ok: response.ok, isFriend: data.isFriend };
  } catch (error) {
    console.error("친구 여부 확인 실패:", error);
    return { ok: false, isFriend: false };
  }
};
