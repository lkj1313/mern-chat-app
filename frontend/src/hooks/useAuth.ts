// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { UserType } from "../types/UserType";

export const useAuth = () => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return { user };
};
