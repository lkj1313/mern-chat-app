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
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null); // 스크롤을 감지할 컨테이너
  const { id } = useParams();
  const [message, setMessage] = useState("");

  // 메시지를 내가 보낸 메시지인지 확인하는 ref
  const isMessageSent = useRef(false);
  const isFirstRender = useRef(true); // 첫 렌더링 확인
  const prevMessageCount = useRef(0); // 메시지 개수를 추적하기 위한 ref

  const { room } = useChatRoom(id, user);
  const { messages, sendMessage, loadMoreMessages, isLoading } =
    useMessages(id);

  // 텍스트 메시지를 보내는 함수
  const handleSendMessage = () => {
    if (!message.trim() || !user || !id) return;

    const messageData = {
      room: id,
      sender: user._id,
      message,
      timestamp: new Date().toISOString(),
    };

    sendMessage(messageData); // 소켓을 통해 메시지 전송
    setMessage(""); // 메시지 입력창 초기화
    isMessageSent.current = true; // 내가 보낸 메시지라는 플래그 설정
  };

  // 이미지 메시지를 업로드하고 보내는 함수
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
      isMessageSent.current = true; // 내가 보낸 메시지 플래그 설정
    } else {
      alert("이미지 업로드 실패");
    }
  };

  // ✅ 메시지가 추가될 때만 자동 스크롤
  useEffect(() => {
    // 처음 렌더링 시, messages가 로딩되었을 때만 자동으로 스크롤을 내리기
    if (
      isFirstRender.current &&
      messages.length > 0 &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      isFirstRender.current = false; // 첫 번째 렌더링 이후에는 자동 스크롤을 비활성화
    }

    // 내가 보낸 메시지일 때만 스크롤 내리기
    if (isMessageSent.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      isMessageSent.current = false; // 플래그 리셋
    }
  }, [messages]); // messages가 변경될 때마다 실행되지만, 첫 렌더링 이후에는 자동 스크롤만 실행

  // 스크롤 이벤트 처리 (무한 스크롤 구현)
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop } = messageContainerRef.current;

      // 스크롤이 맨 위에 가까워지면 추가 메시지 로드
      if (scrollTop === 0 && !isLoading) {
        const prevHeight = messageContainerRef.current.scrollHeight; // 이전 전체 높이 저장
        prevMessageCount.current = messages.length; // 기존 메시지 개수 저장

        loadMoreMessages(); // 추가 메시지 로드

        setTimeout(() => {
          if (messageContainerRef.current) {
            const newHeight = messageContainerRef.current.scrollHeight; // 새로운 전체 높이
            const heightDiff = newHeight - prevHeight; // 추가된 메시지만큼의 높이 차이

            messageContainerRef.current.scrollTop = heightDiff; // 추가된 메시지만큼 아래로 이동
          }
        }, 100); // 메시지 로드 후, UI 업데이트를 반영하기 위해 약간의 딜레이 추가
      }
    }
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (messageContainerRef.current) {
        messageContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading]); // `isLoading`이 변경될 때마다 스크롤 이벤트를 설정

  return (
    <div className="h-full flex flex-col">
      <Header roomInfo={room} />
      <main
        className="flex-1 p-5 bg-gray-800 overflow-y-auto"
        ref={messageContainerRef}
        style={{ height: "100vh" }}
      >
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} />
      </main>
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
