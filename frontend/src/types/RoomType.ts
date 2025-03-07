export interface RoomType {
  _id: string;
  name: string;
  image: string;
  createdBy: { _id: string; name: string; email: string };
  users: { _id: string; name: string; email: string }[];
}
