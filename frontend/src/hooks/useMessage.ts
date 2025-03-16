import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";
import { uploadImageMessage } from "../api/messages";
import { MessageType } from "../types/MessageType";

import { useAuth } from "./useAuth";
const useMessages = (roomId: string | undefined) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [page, setPage] = useState(1); // 페이지 번호 (초기 값: 1)
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [message, setMessage] = useState(""); // 텍스트 메시지 상태
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const isMessageSent = useRef(false);
  const isFirstRender = useRef(true);
  const prevMessageCount = useRef(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", { roomId, page });

    const loadMessages = (page: number) => {
      setIsLoading(true);
      socket.emit("load_messages", { roomId, page });
    };

    loadMessages(page);

    socket.on("load_messages", (newMessages: MessageType[]) => {
      setMessages((prevMessages) => [
        ...newMessages.reverse(),
        ...prevMessages,
      ]);
      setIsLoading(false);
    });

    socket.on("receive_message", (newMessage: MessageType) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [roomId, page]);

  // 텍스트 메시지 전송 함수
  const handleSendMessage = () => {
    if (!message.trim() || !roomId || !user) return;

    const messageData = {
      room: roomId,
      sender: user._id, // or use user._id
      message,
      timestamp: new Date().toISOString(),
    };

    sendMessage(messageData); // 소켓을 통해 메시지 전송
    setMessage(""); // 메시지 입력창 초기화
    isMessageSent.current = true; // 내가 보낸 메시지 플래그 설정
  };

  // 이미지 메시지를 업로드하고 보내는 함수
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const response = await uploadImageMessage(file); // 서버로 이미지 업로드
    if (response.ok) {
      sendMessage({
        room: roomId,
        sender: socket.id, // or use user._id
        imageUrl: response.imageUrl, // 서버로부터 받은 이미지 URL
        timestamp: new Date().toISOString(),
        type: "image",
      });
      isMessageSent.current = true; // 내가 보낸 메시지 플래그 설정
    } else {
      alert("이미지 업로드 실패");
    }
  };

  const sendMessage = (messageData: any) => {
    socket.emit("send_message", messageData); // 메시지를 서버로 전송
  };

  // ✅ 자동 스크롤 처리
  useEffect(() => {
    if (
      isFirstRender.current &&
      messages.length > 0 &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      isFirstRender.current = false;
    }

    if (isMessageSent.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      isMessageSent.current = false;
    }
  }, [messages]);

  // ✅ 무한 스크롤 처리
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight } = messageContainerRef.current;

      if (scrollTop === 0 && !isLoading) {
        const prevHeight = scrollHeight;
        prevMessageCount.current = messages.length;

        loadMoreMessages();

        setTimeout(() => {
          if (messageContainerRef.current) {
            const newHeight = messageContainerRef.current.scrollHeight;
            const heightDiff = newHeight - prevHeight;
            messageContainerRef.current.scrollTop = heightDiff; // 부드럽게 스크롤을 내리기
          }
        }, 100);
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
  }, [isLoading]);

  // 무한 스크롤을 위한 메시지 로드 함수
  const loadMoreMessages = () => {
    if (!isLoading) {
      setPage((prev) => prev + 1); // 페이지 번호 증가 후 더 많은 메시지를 로드
    }
  };

  return {
    messages,
    handleSendMessage,
    handleImageUpload,
    message,
    setMessage,
    messageContainerRef,
    messagesEndRef,
    isLoading,
  };
};

export default useMessages;
