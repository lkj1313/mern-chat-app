import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import logo from "../assets/logo/Telegram_logo.png";
import EmojiPicker from "emoji-picker-react"; // ✅ 이모지 라이브러리 추가
interface RoomType {
  _id: string;
  name: string;
  image: string;
  createdBy: { name: string; email: string }; // ✅ 방장 정보
  users: { name: string; email: string }[]; // ✅ 참여자 목록
}
// ✅ 메시지 타입 정의
interface Message {
  room: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  }; // ✅ sender를 객체로 변경
  message: string;
  timestamp?: string;
}

const socket = io("http://localhost:5005"); // ✅ 소켓 서버 주소
const RoomPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); // ✅ 올바른 타입 지정
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ 이모지 선택창 상태
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
  } | null>(null); // ✅ 로그인한 유저 정보

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(`http://localhost:5005/api/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRoom(data);
        } else {
          alert("방 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };

    fetchRoomDetails();
  }, [id]);
  useEffect(() => {
    // ✅ localStorage에서 로그인한 유저 정보 가져오기
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (id) {
      socket.emit("join_room", id);

      socket.on("load_messages", (loadedMessages: Message[]) => {
        setMessages(loadedMessages);
      });

      socket.on("receive_message", (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    }

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [id]);

  const sendMessage = () => {
    if (message.trim() === "" || !user) return;

    const messageData = {
      room: id || "",
      sender: user._id, // ✅ MongoDB ObjectId 사용 (닉네임이 아니라 _id 전송)
      message: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    setMessage("");
  };

  // ✅ 이모지를 입력 필드에 추가하는 함수
  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };
  return (
    <div className="h-full flex flex-col">
      <Header roomInfo={room} />
      <main className="flex-1 p-5 bg-gray-800 overflow-y-auto">
        {messages.map((msg, index) => {
          const isMyMessage =
            user?._id?.toString() === msg.sender?._id?.toString(); // ✅ 문자열 변환 후 비교

          return (
            <div
              key={index}
              className={`mb-2 flex ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  isMyMessage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <strong>{msg.sender.name}</strong>
                <p>{msg.message}</p>
                <span className="text-xs text-gray-300">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="h-15 px-15 py-2 bg-gray-700 relative">
        {showEmojiPicker && (
          <div className=" bg-gray-800  shadow-lg absolute bottom-15 left-0">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {/* ✅ 이모지 선택창 (showEmojiPicker가 true일 때 표시됨) */}
        <button
          className="text-4xl absolute top-2 left-2 cursor-pointer"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😊
        </button>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-full p-1 text-white text-1xl"
          placeholder="메시지를 입력하세요..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        ></input>
        <img
          className="w-10 absolute top-3 right-2 cursor-pointer"
          src={logo}
          onClick={sendMessage}
        ></img>
      </footer>
    </div>
  );
};

export default RoomPage;
