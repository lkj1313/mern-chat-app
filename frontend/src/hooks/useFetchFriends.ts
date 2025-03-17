import { useState, useEffect } from "react";
import { fetchFriendsAPI } from "../api/friend";
import { UserType } from "../types/UserType";

export const useFetchFriends = () => {
  const [friends, setFriends] = useState<UserType[]>([]);

  const fetchFriends = async () => {
    const response = await fetchFriendsAPI();
    if (response.ok) {
      setFriends(response.friends);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return { friends, setFriends };
};
