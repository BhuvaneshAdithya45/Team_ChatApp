import { useState, useEffect } from "react";
import socket from "../socket";

export default function MessageInput({ channelId, userId }) {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  let typingTimeout;

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      channelId,
      text,
      userId,
    });

    setText("");

    // Stop typing after sending
    socket.emit("stopTyping", { channelId, userId });
    setTyping(false);
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { channelId, userId });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
      socket.emit("stopTyping", { channelId, userId });
    }, 1500);
  };

  return (
    <div className="p-4 border-t border-gray-300 dark:border-gray-700">
      <input
        type="text"
        value={text}
        placeholder="Type a message..."
        onChange={handleTyping}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
