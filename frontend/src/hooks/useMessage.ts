import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { MessageType } from "../types/MessageType";

const useMessages = (roomId: string | undefined) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [page, setPage] = useState(1); // 페이지 번호 (초기 값: 1)
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  useEffect(() => {
    if (!roomId) return; // `roomId`가 없으면 아무 작업도 하지 않음

    // 소켓 연결이 안 되어 있을 경우 먼저 연결
    if (!socket.connected) {
      socket.connect(); // 소켓 연결을 수동으로 시작
    }

    // 연결이 완료되면 'join_room' 이벤트 전송
    socket.emit("join_room", { roomId, page });

    // 페이지 변경 시 메시지 로드
    const loadMessages = (page: number) => {
      setIsLoading(true);
      socket.emit("load_messages", { roomId, page }); // 서버에 메시지 요청
    };

    // 처음 20개 메시지 로드
    loadMessages(page);

    // 서버에서 메시지 로드 처리
    socket.on("load_messages", (newMessages: MessageType[]) => {
      // 메시지 배열에 추가
      setMessages((prevMessages) => [
        ...newMessages.reverse(), // 새로운 메시지가 위로 추가되게
        ...prevMessages,
      ]);
      setIsLoading(false); // 로딩 완료
    });

    // 새로운 메시지 수신 처리
    socket.on("receive_message", (newMessage: MessageType) => {
      setMessages((prevMessages) => [
        ...prevMessages, // 기존 메시지 배열에 새로운 메시지 추가
        newMessage,
      ]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
    };
  }, [roomId, page]); // `roomId`와 `page`가 변경될 때마다 실행

  const sendMessage = (messageData: any) => {
    socket.emit("send_message", messageData); // 메시지를 서버로 전송
  };

  const loadMoreMessages = () => {
    if (!isLoading) {
      setPage((prev) => prev + 1); // 페이지 번호 증가 후 더 많은 메시지를 로드
    }
  };

  return { messages, sendMessage, loadMoreMessages, isLoading };
};

export default useMessages;
