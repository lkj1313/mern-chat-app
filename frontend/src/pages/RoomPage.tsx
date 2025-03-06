import { useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import logo from "../assets/logo/Telegram_logo.png";
import clipIcon from "../assets/icons/clipIcon.png";
import EmojiPicker from "emoji-picker-react"; // ✅ 이모지 라이브러리 추가
import { RoomType } from "../types/RoomType";
import { MessageType } from "../types/MessageType";
import { UserType } from "../types/UserType";

const RoomPage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL; // ✅ 환경 변수 가져오기
  const socket = io(serverUrl); // ✅ 소켓 서버 주소
  const { id } = useParams();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ 이모지 선택창 상태
  const [user, setUser] = useState<UserType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  // 채팅보내는 함수
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
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/messages/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        // ✅ 소켓을 통해 이미지 URL 전송
        const messageData = {
          room: id || "",
          sender: user?._id,
          imageUrl: data.imageUrl, // ✅ 이미지 URL을 메시지로 전송
          timestamp: new Date().toISOString(),
          type: "image", // ✅ 메시지 타입 추가
        };

        socket.emit("send_message", messageData);
      } else {
        alert("이미지 업로드 실패!");
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
    }
  };

  // ✅ 이모지를 입력 필드에 추가하는 함수
  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const joinRoom = async () => {
    if (!id || !user) return; // ✅ 방 ID 또는 사용자 정보가 없으면 실행하지 않음.

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      // ✅ API 호출: 사용자를 대화방에 추가
      const response = await fetch(`${serverUrl}/api/rooms/${id}/join`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ 대화방 참가 성공:", data);
        setRoom(data.room); // ✅ 대화방 정보 업데이트
      } else {
      }
    } catch (error) {
      console.error("❌ 대화방 참가 중 오류 발생:", error);
    }
  };

  // 대화방 정보 가져오기
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!user) return; // ✅ user가 설정되지 않았다면 실행하지 않음.

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(`${serverUrl}/api/rooms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRoom(data);

          // ✅ 로그인한 사용자가 이미 대화방에 있는지 확인
          const isUserInRoom = data.users.some(
            (u: { _id: string }) => u._id === user?._id
          );

          if (!isUserInRoom) {
            const confirmJoin = window.confirm("대화방에 입장하시겠습니까?");
            if (confirmJoin) {
              joinRoom();
            } else {
              navigate("/home");
            }
          }
        } else {
          alert("방 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("방 정보 불러오기 실패:", error);
      }
    };

    if (id && user) {
      fetchRoomDetails(); // ✅ user가 설정된 후에만 실행됨
    }
  }, [id, user]); // ✅ user를 의존성 배열에 추가

  useEffect(() => {
    // ✅ localStorage에서 로그인한 유저 정보 가져오기
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (id) {
      socket.emit("join_room", id);

      socket.on("load_messages", (loadedMessages: MessageType[]) => {
        setMessages(loadedMessages);
      });

      socket.on("receive_message", (newMessage: MessageType) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    }

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [id]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              {/* ✅ 상대방 프로필 사진 추가 */}
              {!isMyMessage && (
                <img
                  src={
                    `${serverUrl}${msg.sender.profilePicture}` ||
                    "/uploads/default-avatar.png"
                  } // ✅ 기본 이미지 설정
                  alt={msg.sender.name}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  isMyMessage
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <strong>{msg.sender.name}</strong>
                {/* ✅ 이미지 메시지인 경우 */}
                {msg.imageUrl ? (
                  <img
                    src={
                      msg.imageUrl.startsWith("http")
                        ? msg.imageUrl
                        : `${serverUrl}${msg.imageUrl}`
                    }
                    alt="전송된 이미지"
                    className="max-w-full rounded-lg mt-2"
                  />
                ) : (
                  <p>{msg.message}</p>
                )}
                <span className="text-xs text-gray-300">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString()
                    : ""}
                </span>
              </div>{" "}
              {/* ✅ 스크롤을 아래로 이동하기 위한 Ref */}
              <div ref={messagesEndRef} />
            </div>
          );
        })}
      </main>

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
        {message ? (
          <img
            className="w-8 cursor-pointer"
            src={logo}
            onClick={sendMessage}
          ></img>
        ) : (
          <>
            {/* 숨겨진 파일 입력 */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            {/* 이미지 선택 버튼 */}
            <img
              className="w-8 cursor-pointer"
              src={clipIcon}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            ></img>
          </>
        )}
      </footer>
    </div>
  );
};

export default RoomPage;
