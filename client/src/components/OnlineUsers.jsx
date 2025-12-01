import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import { UserCacheContext } from "../context/UserCacheContext";

export default function OnlineUsers({ activeChannel }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { userCache } = useContext(UserCacheContext);
  const selfId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    if (!activeChannel) return;

    socket.on("onlineUsers", (users) => {
      console.log("Online users received:", users);
      console.log("User cache:", userCache);
      setOnlineUsers(users);
    });

    return () => socket.off("onlineUsers");
  }, [activeChannel, userCache]);

  if (!activeChannel) {
    return (
      <div className="h-full p-4 flex items-center justify-center text-gray-500">
        Select a channel
      </div>
    );
  }

  return (
    <div className="h-full p-2 bg-gray-800 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-2">Online</h2>

      <div className="space-y-2">
        {onlineUsers.map((uid) => (
          <div
            key={uid}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-600"
          >
            <span className="w-3 h-3 rounded-full bg-green-500"></span>

            {/* Replace ID with name from cache */}
            <span className="text-sm">
              {uid === selfId ? "You" : (userCache[uid] || "User")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
