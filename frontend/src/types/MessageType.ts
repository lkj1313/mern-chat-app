import { UserType } from "./UserType";

//  메시지 타입 정의
export interface MessageType {
  room: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  }; //  sender를 객체로 변경
  message?: string;
  imageUrl?: string;
  timestamp?: string;
}
// 다이렉트메세지타입
export type DirectMessageType = {
  _id: string; //   채팅방 ID
  users: UserType[]; //  1:1 채팅 참여자 (2명)
  lastMessage: string; //  마지막 메시지 (텍스트 미리보기용)
  lastMessageSender: UserType | null; //  마지막 메시지를 보낸 사람
  lastMessageAt: string | null; //  마지막 메시지 시간 (ISO 형식)
  createdAt: string; //  생성일 (ISO 형식)
  updatedAt: string; //  마지막 업데이트 (ISO 형식)
  //  Header에서 필요한 속성 추가 (자동 변환)
  name?: string; // 상대방 이름
  image?: string; // 상대방 프로필 이미지
};
