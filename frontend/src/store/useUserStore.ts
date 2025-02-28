import { create } from "zustand";

interface UserState {
  user: { name?: string; email?: string; profilePicture?: string } | null;
  setUser: (user: UserState["user"]) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // 상태 초기화 시 localStorage에서 user 값을 가져옴
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setUser: (user) => {
    // 상태를 업데이트하고 localStorage에 저장
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    // 상태를 null로 초기화하고 localStorage에서 user 제거
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
