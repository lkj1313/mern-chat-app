import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { MessageType } from "../types/MessageType";

const useMessages = (roomId: string | undefined) => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (!roomId) return; // `roomId`가 없으면 아무 작업도 하지 않음

    // 연결되지 않은 경우에만 connect
    if (!socket.connected) {
      socket.connect(); // 수동 연결 (소켓이 연결되지 않았을 때만)
    }

    socket.emit("join_room", roomId); // 'join_room' 이벤트를 서버에 전송하여 해당 방에 참가

    socket.on("load_messages", setMessages); // 'load_messages' 이벤트 발생 시 `setMessages` 실행 (메시지 로드)

    socket.on("receive_message", (newMessage: MessageType) => {
      setMessages((prev) => [...prev, newMessage]); // 새 메시지가 오면 `messages` 배열에 추가
    });

    return () => {
      // cleanup 함수: 컴포넌트 언마운트 또는 `roomId` 변경 시 실행
      socket.off("load_messages"); // 'load_messages' 이벤트 리스너 제거
      socket.off("receive_message"); // 'receive_message' 이벤트 리스너 제거
      if (socket.connected) {
        socket.disconnect(); // 소켓 연결을 종료
      }
    };
  }, [roomId]); // `roomId`가 변경될 때마다 이 `useEffect`가 다시 실행

  const sendMessage = (messageData: any) => {
    socket.emit("send_message", messageData);
  };

  return { messages, sendMessage };
};

export default useMessages;
