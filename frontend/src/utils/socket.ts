// src/utils/socket.ts
import { io } from "socket.io-client";

// 환경 변수에서 WebSocket URL 가져오기
const socketUrl = import.meta.env.VITE_SOCKET_URL; // WebSocket URL

export const socket = io(socketUrl, { autoConnect: false });
