import { useRef, useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import logo from "../../assets/logo/Telegram_logo.png";
import clipIcon from "../../assets/icons/clipIcon.png";

// MessageInputProps type 정의
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 이모지 선택창 상태
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null); // 이모지 버튼 참조
  const emojiPickerRef = useRef<HTMLDivElement | null>(null); // 이모지 선택창 참조
  const inputRef = useRef<HTMLInputElement | null>(null); // 메시지 입력창 참조
  const fileInputRef = useRef<HTMLInputElement | null>(null); // 파일 입력창 참조

  // 이모지를 입력 필드에 추가하는 함수
  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev: string) => prev + emojiObject.emoji);
  };

  // 클릭한 위치가 이모지 버튼이나 이모지 선택창 외부라면 이모지를 닫는 함수
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false); // 외부 클릭 시 이모지 선택창 숨기기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // 이펙트가 마운트 될 때만 실행

  return (
    <footer className="h-15 py-2 px-10 gap-3 flex items-center bg-gray-700 relative">
      {showEmojiPicker && (
        <div
          className="bg-gray-800 shadow-lg absolute bottom-15 left-0"
          ref={emojiPickerRef} // 이모지 선택창에 ref 추가
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* 이모지 버튼 */}
      <button
        className="text-3xl cursor-pointer"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        ref={emojiButtonRef} // 이모지 버튼에 ref 추가
      >
        😊
      </button>

      {/* 메시지 입력창 */}
      <input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="h-full p-1 text-white text-1xl flex-grow"
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
          ref={fileInputRef} // 파일 입력창 참조
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
          onClick={() => fileInputRef.current?.click()} // 파일 업로드 클릭
        />
      </div>
    </footer>
  );
};

export default MessageInput;
