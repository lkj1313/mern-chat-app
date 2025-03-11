import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useRef, useState } from "react";
import { uploadImageMessage } from "../api/messages";
import MessageInput from "../components/chat/MessageInput";
import useMessages from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";
import MessageList from "../components/chat/MessageList";
import useDirectChat from "../hooks/useDirectChat";

const DirectMessagePage = () => {
  const { user } = useAuth();
  const { id } = useParams(); // ✅ 상대방 userId 가져오기
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // ✅ 1:1 채팅방 정보 가져오기
  const { chat, chatPartner } = useDirectChat(id, user);

  // ✅ 소켓 연결 및 메시지 상태 관리
  const { messages, sendMessage } = useMessages(chat?._id);

  // ✅ `Header`에 맞게 `roomInfo` 변환
  const roomInfo = chat
    ? {
        _id: chat._id,
        name: chatPartner?.name || "대화 상대 없음", // ✅ 상대방 이름
        image: chatPartner?.profilePicture || "/uploads/default-avatar.png", // ✅ 상대방 프로필 이미지
        users: [chatPartner || { _id: "", name: "알 수 없음", email: "" }],
        createdBy: { name: "" }, // ✅ 1:1 채팅에서는 방장 정보 필요 없음
        type: "direct",
      }
    : null;

  // ✅ 텍스트 메시지를 보내는 함수
  const handleSendMessage = () => {
    if (!message.trim() || !user || !chat?._id) return;

    sendMessage({
      room: chat._id,
      sender: user._id,
      message,
      timestamp: new Date().toISOString(),
    });

    setMessage("");
  };

  // ✅ 이미지 메시지를 업로드하고 보내는 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !chat?._id) return;

    const response = await uploadImageMessage(file);
    if (response.ok) {
      sendMessage({
        room: chat._id,
        sender: user._id,
        imageUrl: response.imageUrl,
        timestamp: new Date().toISOString(),
        type: "image",
      });
    } else {
      alert("이미지 업로드 실패");
    }
  };

  // ✅ 메시지가 변경될 때 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // ✅ 100ms 지연 후 스크롤 실행 (렌더링 완료 대기)
    }
  }, [messages]);

  // ✅ 채팅방이 없을 경우 UI 처리
  if (!chat) {
    return (
      <div className="text-white text-center mt-5">
        채팅방을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ✅ 1:1 채팅방에 맞게 `Header` 수정 */}
      <Header roomInfo={roomInfo} />

      {/* ✅ 메시지 목록 */}
      <main className="flex-1 p-5 bg-gray-800 overflow-y-auto">
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} />
      </main>

      {/* ✅ 메시지 입력창 */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        sendMessage={handleSendMessage}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default DirectMessagePage;
