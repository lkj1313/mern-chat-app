// ✅ 메시지 타입 정의
export interface MessageType {
  room: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  }; // ✅ sender를 객체로 변경
  message?: string;
  imageUrl?: string;
  timestamp?: string;
}
