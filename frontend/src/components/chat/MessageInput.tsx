import logo from "../../assets/logo/Telegram_logo.png";
import clipIcon from "../../assets/icons/clipIcon.png";
import EmojiPicker from "emoji-picker-react";
import { useRef, useState } from "react";
type MessageInputProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const MessageInput = ({
  message,
  setMessage,
  sendMessage,
  handleImageUpload,
}: MessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ 이모지 선택창 상태

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // ✅ 이모지를 입력 필드에 추가하는 함수
  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev: string) => prev + emojiObject.emoji);
  };

  return (
    <footer className="h-15 py-2 px-10  gap-3 flex items-center bg-gray-700 relative">
      {showEmojiPicker && (
        <div className=" bg-gray-800  shadow-lg absolute bottom-15 left-0">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      {/* ✅ 이모지 선택창 (showEmojiPicker가 true일 때 표시됨) */}
      <button
        className="text-3xl cursor-pointer"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      >
        😊
      </button>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className=" h-full p-1 text-white text-1xl flex-grow"
        placeholder="메시지를 입력하세요..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      ></input>
      <div className="relative w-8 h-8">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* 메시지 있을 때 보여줄 이미지 */}
        <img
          className={`absolute inset-0 transition-opacity duration-300 cursor-pointer ${
            message
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          src={logo}
          alt="Send message"
          onClick={sendMessage}
        />

        {/* 메시지 없을 때 보여줄 이미지 */}
        <img
          className={`absolute inset-0 transition-opacity duration-300 cursor-pointer ${
            !message
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          src={clipIcon}
          alt="Upload image"
          onClick={() => fileInputRef.current?.click()}
        />
      </div>
    </footer>
  );
};

export default MessageInput;
