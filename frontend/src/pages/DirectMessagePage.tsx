import { useParams } from "react-router-dom";
import Header from "../components/Header";

import MessageInput from "../components/message/MessageInput";
import MessageList from "../components/message/MessageList";
import useMessages from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";

import useDirectChat from "../hooks/useDirectChat";

const DirectMessagePage = () => {
  const { user } = useAuth();
  const { id } = useParams(); // 상대방 userId 가져오기

  // 1:1 채팅방 정보 가져오기
  const { chat, chatPartner } = useDirectChat(id, user);

  // 메시지 상태와 관련된 훅 사용
  const {
    messages,
    handleSendMessage,
    handleImageUpload,
    message,
    setMessage,
    messageContainerRef,
    messagesEndRef,
  } = useMessages(chat?._id);

  // `roomInfo` 설정
  const roomInfo = chat
    ? {
        _id: chat._id,
        name: chatPartner?.name || "대화 상대 없음", // 상대방 이름
        image: chatPartner?.profilePicture || "/uploads/default-avatar.png", // 상대방 프로필 이미지
        users: [chatPartner || { _id: "", name: "알 수 없음", email: "" }],
        createdBy: { name: "" }, // 1:1 채팅에서 방장 정보는 필요 없음
        type: "direct",
      }
    : null;

  return (
    <div className="h-full flex flex-col">
      <Header roomInfo={roomInfo} />
      <main
        ref={messageContainerRef}
        className="flex-1 p-5 bg-gray-800 overflow-y-auto"
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

export default DirectMessagePage;
