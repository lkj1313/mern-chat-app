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
  const messageContainerRef = useRef<HTMLDivElement | null>(null); // 스크롤을 감지할 컨테이너
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  //  1:1 채팅방 정보 가져오기
  const { chat, chatPartner } = useDirectChat(id, user);

  //  소켓 연결 및 메시지 상태 관리
  const { messages, sendMessage, loadMoreMessages, isLoading } = useMessages(
    chat?._id
  );
  // 메시지를 내가 보낸 메시지인지 확인하는 ref
  const isMessageSent = useRef(false);
  const isFirstRender = useRef(true); // 첫 렌더링 확인
  //  `Header`에 맞게 `roomInfo` 변환
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

  //  텍스트 메시지를 보내는 함수
  const handleSendMessage = () => {
    if (!message.trim() || !user || !chat?._id) return;

    sendMessage({
      room: chat._id,
      sender: user._id,
      message,
      timestamp: new Date().toISOString(),
    });
    isMessageSent.current = true; // 내가 보낸 메시지라는 플래그 설정
    setMessage("");
  };

  //  이미지 메시지를 업로드하고 보내는 함수
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
      isMessageSent.current = true; // 내가 보낸 메시지라는 플래그 설정
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

  //  스크롤 이벤트 처리 (무한 스크롤 구현)
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop } = messageContainerRef.current;

      // 스크롤이 맨 위에 가까워지면 추가 메시지를 로드
      if (scrollTop === 0 && !isLoading) {
        loadMoreMessages(); // 더 많은 메시지를 로드
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
      {/*  1:1 채팅방에 맞게 `Header` 수정 */}
      <Header roomInfo={roomInfo} />

      {/*  메시지 목록 */}
      <main
        ref={messageContainerRef}
        className="flex-1 p-5 bg-gray-800 overflow-y-auto"
      >
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} />
      </main>

      {/*  메시지 입력창 */}
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
