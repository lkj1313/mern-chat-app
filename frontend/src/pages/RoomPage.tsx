import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState, useRef } from "react";
import { uploadImageMessage } from "../api/messages";

import MessageInput from "../components/chat/MessageInput";
import useChatRoom from "../hooks/useChatRoom";
import useMessages from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";
import MessageList from "../components/chat/MessageList";

const RoomPage = () => {
  // ✅ 현재 로그인한 사용자 정보 가져오기
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // ✅ 현재 URL에서 방 ID 가져오기
  const { id } = useParams();

  // ✅ 입력창의 메시지 상태 관리
  const [message, setMessage] = useState("");

  // ✅ 방 정보를 가져오고, 방 참가 여부를 확인하는 커스텀 훅 사용
  const { room } = useChatRoom(id, user);

  // ✅ 소켓 연결 및 메시지 상태 관리를 위한 훅 사용
  const { messages, sendMessage } = useMessages(id);

  // ✅ 텍스트 메시지를 보내는 함수
  const handleSendMessage = () => {
    if (!message.trim() || !user || !id) return;

    const messageData = {
      room: id, // 방 ID
      sender: user._id, // 메시지 발신자 ID (현재 로그인한 사용자)
      message, // 입력한 메시지 텍스트
      timestamp: new Date().toISOString(), // 메시지 전송 시각
    };

    sendMessage(messageData); // 소켓을 통해 메시지 전송
    setMessage(""); // 메시지 입력창 초기화
  };

  // ✅ 이미지 메시지를 업로드하고 보내는 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !id) return;

    const response = await uploadImageMessage(file); // 서버로 이미지 업로드
    if (response.ok) {
      sendMessage({
        room: id,
        sender: user._id,
        imageUrl: response.imageUrl, // 서버로부터 받은 이미지 URL
        timestamp: new Date().toISOString(),
        type: "image",
      });
    } else {
      alert("이미지 업로드 실패");
    }
  };

  // ✅ 메시지가 변경될 때마다 메시지 목록 하단으로 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // ✅ 100ms 지연 후 스크롤 실행 (렌더링 완료 대기)
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* ✅ 방 정보가 포함된 헤더 */}
      <Header roomInfo={room} />

      {/* ✅ 메시지 목록을 보여주는 메인 영역 */}
      <main className="flex-1 p-5 bg-gray-800 overflow-y-auto">
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} /> {/* 자동 스크롤을 위한 빈 div */}
      </main>

      {/* ✅ 메시지 입력창 및 이미지 업로드 컴포넌트 */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        sendMessage={handleSendMessage}
        handleImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default RoomPage;
