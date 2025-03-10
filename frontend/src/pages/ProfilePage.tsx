import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { fetchUserInfoAPI } from "../api/user";
import { UserType } from "../types/UserType";
import messageIcon from "../assets/icons/messageIcon.png";
const ProfilePage = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  console.log(userId);
  const handleGoBack = () => navigate(-1);
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const { ok, user } = await fetchUserInfoAPI(userId);
      if (ok) {
        setUser(user);
      } else {
        console.log("유저 정보를 가져오는데 실패함");
      }
    };
    fetchUser();
  }, [userId]);
  console.log(user);
  return (
    <div className="bg-gray-900">
      <header className=" bg-gray-700 flex flex-col p-5  gap-5 relative">
        <div className="flex justify-between items-center ">
          <IoChevronBack
            onClick={handleGoBack}
            size={30}
            color="white"
            className="cursor-pointer mr-16"
          />
          <FaEllipsisVertical
            color="white"
            size={20}
            // onClick={openMenu}
            className="cursor-pointer"
          />
        </div>

        <div>
          <div className="flex gap-5 items-center">
            <img
              className="w-20 h-20 rounded-full"
              src={`${serverUrl}${user?.profilePicture}`}
            ></img>
            <div className="flex flex-col justify-center">
              <span className="text-white text-[30px] ">
                <strong>{user?.name}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="w-15 h-15 flex items-center justify-center  absolute -bottom-8 right-2 rounded-full bg-blue-300">
          <img className="w-10 h-10" src={messageIcon}></img>
        </div>
      </header>

      <main className="bg-gray-800 p-5">
        <h2 className="text-blue-400">
          <strong>정보</strong>
        </h2>
        <div>
          <div className="text-white">{user?.email}</div>
          <div className="text-gray-400 text-[10px]">이메일</div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
