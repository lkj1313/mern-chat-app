const serverUrl = import.meta.env.VITE_SERVER_URL;

/// 특정 유저의 정보 가져오는 API
export const fetchUserInfoAPI = async (userId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${serverUrl}/api/auth/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, user: data };
};
