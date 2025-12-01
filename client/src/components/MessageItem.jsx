import moment from "moment";
import { useContext, useState } from "react";
import { UserCacheContext } from "../context/UserCacheContext";
import API from "../api/api";
import socket from "../socket";

export default function MessageItem({ message, onProfileClick }) {
  const { userCache } = useContext(UserCacheContext);
  const selfId = JSON.parse(localStorage.getItem("user")).id;
  const token = localStorage.getItem("token");

  const [editing, setEditing] = useState(false);
  const [newText, setNewText] = useState(message.text);

  const senderId = message.senderId?._id || message.senderId;
  const senderName =
    senderId === selfId ? "You" : userCache[senderId] || "User";

  const isMine = senderId === selfId;

  const saveEdit = async () => {
    if (!newText.trim()) {
      alert("Message cannot be empty");
      return;
    }

    try {
      const res = await API.patch(
        `/messages/${message._id}`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit socket event to sync in real-time
      socket.emit("editMessage", res.data);

      setEditing(false);
    } catch (err) {
      alert("Edit failed: " + err.response?.data?.message || err.message);
    }
  };

  const deleteMsg = async () => {
    if (!confirm("Delete this message?")) return;

    try {
      const res = await API.delete(`/messages/${message._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Emit socket event to sync deletion
      socket.emit("deleteMessage", res.data.id);

    } catch (err) {
      alert("Delete failed: " + err.response?.data?.message || err.message);
    }
  };

  return (
    <div
      id={message._id}
      className={`flex flex-col ${
        isMine ? "items-end text-right" : "items-start text-left"
      }`}
    >
      {/* Username + Timestamp */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">

        {/* Username Clickable (Except You) */}
        <span
          className={`font-medium ${
            isMine ? "" : "cursor-pointer hover:underline"
          }`}
          onClick={() => {
            if (!isMine) onProfileClick(senderId);
          }}
        >
          {senderName}
        </span>

        <span>· {moment(message.createdAt).format("h:mm A")}</span>
      </div>

      {/* Edit Mode or Message Display */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white outline-none"
          />

          <button
            onClick={saveEdit}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Save
          </button>

          <button
            onClick={() => {
              setEditing(false);
              setNewText(message.text);
            }}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <div
            className={`px-4 py-2 rounded-xl shadow-sm max-w-[75%] break-words transition-all duration-150
            ${
              isMine
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-300 dark:bg-gray-500 text-black dark:text-white rounded-bl-none"
            }`}
          >
            {message.text}
            {message.edited && (
              <span className="ml-2 text-xs opacity-70">(edited)</span>
            )}
          </div>

          {isMine && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-400 hover:underline"
                title="Edit"
              >
                ✏️
              </button>

              <button
                onClick={deleteMsg}
                className="text-xs text-red-400 hover:underline"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
