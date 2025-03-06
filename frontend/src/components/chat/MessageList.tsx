import { MessageType } from "../../types/MessageType";
import { UserType } from "../../types/UserType";
import MessageItem from "./MessageItem";

type MessageListProps = {
  messages: MessageType[];
  currentUser: UserType | null;
};

const MessageList = ({ messages, currentUser }: MessageListProps) => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  return (
    <>
      {messages.map((msg, index) => (
        <MessageItem
          key={index}
          message={msg}
          isMyMessage={currentUser?._id === msg.sender._id}
          serverUrl={serverUrl}
        />
      ))}
    </>
  );
};

export default MessageList;
