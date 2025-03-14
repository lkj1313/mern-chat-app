const serverUrl = import.meta.env.VITE_SERVER_URL;

//회원가입 API
export const signupAPI = async (formData: {
  email: string;
  name: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${serverUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "회원가입 실패");
    }

    return data; // 성공 시 데이터 반환
  } catch (error: any) {
    console.error("회원가입 실패:", error.message);
    throw error; // 에러를 다시 던져서 처리할 수 있도록 함
  }
};
