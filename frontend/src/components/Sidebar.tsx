import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
const serverUrl = import.meta.env.VITE_SERVER_URL;
const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const navigate = useNavigate();
  // 대화방 만들기 버튼 클릭 시 대화방 만들기 페이지로 이동
  const handleCreateRoomClick = () => {
    navigate("/create-room"); // 대화방 만들기 페이지로 이동
  };
  const { user, setUser } = useUserStore();
  const handleLogout = () => {
    //로컬스토레지에서 토큰 및 정보 제거
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    //쥬스탠드 user상태 초기화화
    setUser(null);
    navigate("/");
  };
  // 프로필 사진 변경 처리 함수
  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;
    const file = e.target.files?.[0]; // 선택된 파일

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", user.email ?? "");

    try {
      const response = await fetch(
        `${serverUrl}/api/auth/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // 서버에서 프로필 사진 경로를 받아오면 상태 업데이트
        setUser({ ...user, profilePicture: data.profilePicture });
      } else {
        console.error("이미지 업로드 실패:", data.message);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    }
  };
  return (
    <>
      {" "}
      {/* 어두운 배경 (클릭하면 사이드바 닫힘) */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-30" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />
      <div
        className={`absolute top-0 left-0 h-full w-100 bg-gray-900 text-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }
          transition-transform duration-300 ease-in-out`}
        style={{ maxWidth: "100%" }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-white cursor-pointer"
        >
          ✖
        </button>

        <div className="">
          <section className="p-4 bg-gray-700">
            <label htmlFor="file-upload">
              <img
                className="w-16 rounded-full mb-3 cursor-pointer"
                src={`${serverUrl}${user?.profilePicture}`}
                alt="profile"
              />
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleProfilePictureChange} // 파일 선택 시 처리
            />
            <span>{user?.name}</span>
          </section>
          <ul className="space-y-3 p-5">
            <li
              onClick={handleCreateRoomClick}
              className="cursor-pointer hover:bg-gray-800 p-2 rounded"
            >
              대화방 만들기
            </li>

            <li
              onClick={handleLogout}
              className="cursor-pointer hover:bg-gray-800 p-2 rounded"
            >
              로그아웃
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
