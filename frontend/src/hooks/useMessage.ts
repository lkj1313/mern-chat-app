import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { MessageType } from "../types/MessageType";

const useMessages = (roomId: string | undefined) => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // 연결되지 않은 경우에만 connect
    if (!socket.connected) {
      socket.connect(); // 수동 연결
    }
    socket.emit("join_room", roomId);

    socket.on("load_messages", setMessages);
    socket.on("receive_message", (newMessage: MessageType) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
      if (socket.connected) {
        socket.disconnect(); // 컴포넌트 언마운트 시 연결 끊기
      }
    };
  }, [roomId]);

  const sendMessage = (messageData: any) => {
    socket.emit("send_message", messageData);
  };

  return { messages, sendMessage };
};

export default useMessages;
