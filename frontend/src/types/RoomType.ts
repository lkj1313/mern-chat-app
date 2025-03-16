export interface RoomType {
  _id: string;
  name: string;
  image: string;
  createdBy: { _id: string; name: string; email: string };
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSender: string;
  users: {
    profilePicture: string | undefined;
    _id: string;
    name: string;
    email: string;
  }[];
  type: string;
  directChatPartnerId?: string;
}
