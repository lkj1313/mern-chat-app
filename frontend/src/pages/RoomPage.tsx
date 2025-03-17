import { useParams } from "react-router-dom";
import Header from "../components/Header";

import MessageInput from "../components/message/MessageInput";
import MessageList from "../components/message/MessageList";

import useMessages from "../hooks/useMessage";
import { useAuth } from "../hooks/useAuth";
import useRoomDetails from "../hooks/useRoomDetails";

const RoomPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const { room } = useRoomDetails(id, user);

  const {
    messages,
    handleSendMessage,
    handleImageUpload,
    message,
    setMessage,
    messageContainerRef,
    messagesEndRef,
  } = useMessages(id);

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
