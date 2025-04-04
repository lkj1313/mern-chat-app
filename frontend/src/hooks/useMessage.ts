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
  const prevScrollHeightRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
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

  // 내가 메세지를 보냈을떄, 처음렌더링 됐을떄 스크롤 맨아래로 이동
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

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return; // 메시지 컨테이너가 없으면 종료

    const { scrollTop, scrollHeight } = container;

    // 사용자가 스크롤을 맨 위로 올렸고, 현재 메시지를 불러오는 중이 아니라면
    if (scrollTop === 0 && !isLoading) {
      // 현재 스크롤 영역의 전체 높이를 저장 (나중에 얼마나 늘어났는지 비교용)
      prevScrollHeightRef.current = scrollHeight;

      // 이후 messages가 변경되면 스크롤 위치를 복원하겠다는 플래그 설정
      shouldRestoreScrollRef.current = true;

      // 다음 페이지의 메시지 요청 (page 증가)
      loadMoreMessages();
    }
  };

  // 메시지 목록이 바뀐 후 실행되는 훅 (messages 상태가 변경될 때마다 실행)
  useEffect(() => {
    if (
      shouldRestoreScrollRef.current &&
      messageContainerRef.current &&
      messages.length > prevMessageCount.current
    ) {
      const container = messageContainerRef.current;

      // 메시지 추가 후의 새로운 scrollHeight 측정
      const newHeight = container.scrollHeight;

      // 늘어난 높이 계산
      const heightDiff = newHeight - prevScrollHeightRef.current;

      // 기존 스크롤 위치에서 heightDiff만큼 더해줘서 유저의 시점 유지 (카톡 스타일)
      container.scrollTop += heightDiff;

      // 보정 완료했으니 플래그 초기화
      shouldRestoreScrollRef.current = false;

      // 다음 비교를 위해 현재 메시지 개수 저장
      prevMessageCount.current = messages.length;
    }
  }, [messages]); // messages가 바뀔 때마다 실행
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
