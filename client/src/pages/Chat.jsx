import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import OnlineUsers from "../components/OnlineUsers";
import Navbar from "../components/Navbar";
import socket from "../socket";

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [refreshChannelsFlag, setRefreshChannelsFlag] = useState(false);

  // Refresh sidebar when channel changes
  useEffect(() => {
    if (activeChannel) {
      setRefreshChannelsFlag(prev => !prev);
    }
  }, [activeChannel]);

  // Refresh sidebar when users join/leave (via Socket.IO)
  useEffect(() => {
    socket.on("onlineUsers", () => {
      console.log("Online users changed → refreshing sidebar");
      setRefreshChannelsFlag(prev => !prev);
    });

    return () => socket.off("onlineUsers");
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 dark:bg-gray-900">

      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1">

        {/* Sidebar */}
        <div className="w-48 border-r border-gray-300 dark:border-gray-700">
          <Sidebar 
            activeChannel={activeChannel} 
            setActiveChannel={setActiveChannel}
            refreshRequest={refreshChannelsFlag}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow activeChannel={activeChannel} />
        </div>

        {/* Online Users */}
        <div className="w-48 border-l border-gray-300 dark:border-gray-700 hidden md:block">
          <OnlineUsers activeChannel={activeChannel} />
        </div>

      </div>

    </div>
  );
}
