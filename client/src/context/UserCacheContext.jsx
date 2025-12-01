import { createContext, useEffect, useState } from "react";
import API from "../api/api";

export const UserCacheContext = createContext();

export default function UserCacheProvider({ children }) {
  const [userCache, setUserCache] = useState({}); // userId → name

  const token = localStorage.getItem("token");

  // Load all users on start
  useEffect(() => {
    if (!token) return;

    const loadUsers = async () => {
      try {
        const res = await API.get("/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const map = {};
        res.data.forEach((u) => {
          map[u._id] = u.name;
        });

        setUserCache(map);
        console.log("User cache loaded:", map);
      } catch (err) {
        console.log("User cache error", err);
      }
    };

    loadUsers();
  }, [token]);

  return (
    <UserCacheContext.Provider value={{ userCache }}>
      {children}
    </UserCacheContext.Provider>
  );
}
