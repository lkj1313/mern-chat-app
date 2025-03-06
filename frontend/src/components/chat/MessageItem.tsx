import { MessageType } from "../../types/MessageType";

type MessageItemProps = {
  message: MessageType;
  isMyMessage: boolean;
  serverUrl: string;
};

const MessageItem = ({ message, isMyMessage, serverUrl }: MessageItemProps) => {
  return (
    <div
      className={`mb-2 flex ${isMyMessage ? "justify-end" : "justify-start"}`}
    >
      {!isMyMessage && (
        <img
          src={
            `${serverUrl}${message.sender.profilePicture}` ||
            "/uploads/default-avatar.png"
          }
          alt={message.sender.name}
          className="w-8 h-8 rounded-full object-cover mr-3"
        />
      )}
      <div
        className={`p-3 rounded-lg max-w-xs ${
          isMyMessage ? "bg-blue-500" : "bg-gray-700"
        } text-white`}
      >
        <strong>{message.sender.name}</strong>
        {message.imageUrl ? (
          <img
            src={
              message.imageUrl.startsWith("http")
                ? message.imageUrl
                : `${serverUrl}${message.imageUrl}`
            }
            alt="전송된 이미지"
            className="max-w-full rounded-lg mt-2"
          />
        ) : (
          <p>{message.message}</p>
        )}
        <span className="text-xs text-gray-300">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString()
            : ""}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
