import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserType } from "../types/UserType";
import { DirectMessageType } from "../types/MessageType";
import { createDirectChatAPI } from "../api/rooms"; // ✅ 1:1 채팅방 생성 API만 사용

const useDirectChat = (
  userId: string | undefined,
  currentUser: UserType | null
) => {
  const [chat, setChat] = useState<DirectMessageType | null>(null);
  const [chatPartner, setChatPartner] = useState<UserType | null>(null);
  const navigate = useNavigate();

  // ✅ 1:1 채팅방을 생성하거나 기존 방을 불러오는 함수
  const fetchOrCreateDirectChat = async () => {
    if (!userId || !currentUser) return;

    try {
      // ✅ 기존 방이 없으면 자동으로 생성 (API에서 자동 처리됨)
      const response = await createDirectChatAPI(userId);

      if (!response.ok) {
        alert("채팅방을 생성하는 데 실패했습니다.");
        navigate("/home");
        return;
      }

      const chatData = response.chat;
      setChat(chatData);

      // ✅ 상대방 정보 찾기 (내가 아닌 유저)
      const partner = chatData.users.find(
        (u: { _id: string }) => u._id !== currentUser._id
      );
      setChatPartner(partner || null);
    } catch (error) {
      console.error("🚨 1:1 채팅방 로딩 중 오류:", error);
      navigate("/home");
    }
  };

  useEffect(() => {
    fetchOrCreateDirectChat();
  }, [userId, currentUser]);

  return { chat, chatPartner };
};

export default useDirectChat;
