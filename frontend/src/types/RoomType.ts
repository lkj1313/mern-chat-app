export interface RoomType {
  _id: string;
  name: string;
  image: string;
  createdBy: { name: string };
  users: { _id: string; name: string; email: string }[];
}
