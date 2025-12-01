import { useEffect, useRef, useState, useContext } from "react";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import socket from "../socket";
import API from "../api/api";
import { UserCacheContext } from "../context/UserCacheContext";
import UserProfilePopup from "./UserProfilePopup";
import InviteModal from "./InviteModal";

export default function ChatWindow({ activeChannel }) {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [profileUserId, setProfileUserId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { userCache } = useContext(UserCacheContext);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const containerRef = useRef(null);

  // -----------------------------------
  // Load Latest 20 Messages
  // -----------------------------------
  const loadLatestMessages = async () => {
    try {
      const res = await API.get(`/messages/${activeChannel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(res.data);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 20);
    } catch (err) {
      console.log("Error loading messages:", err);
    }
  };

  // -----------------------------------
  // Load Older Messages (Pagination)
  // -----------------------------------
  const loadOlderMessages = async () => {
    if (messages.length === 0) return;

    const oldestId = messages[0]._id;

    try {
      const res = await API.get(
        `/messages/${activeChannel}?before=${oldestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.length === 0) {
        setHasMore(false);
        return;
      }

      const prevHeight = containerRef.current.scrollHeight;

      setMessages((prev) => [...res.data, ...prev]);

      setTimeout(() => {
        const newHeight = containerRef.current.scrollHeight;
        containerRef.current.scrollTop = newHeight - prevHeight;
      }, 10);
    } catch (err) {
      console.log("Pagination error:", err);
    }
  };

  // -----------------------------------
  // React to Channel Change
  // -----------------------------------
  useEffect(() => {
    if (!activeChannel) return;

    // Fetch channel info to check if private
    const fetchChannelInfo = async () => {
      try {
        const res = await API.get(`/channels`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const channel = res.data.find(ch => ch._id === activeChannel);
        setChannelInfo(channel);

        // Check access
        if (channel && channel.isPrivate && channel.members && !channel.members.includes(user.id)) {
          setHasAccess(false);
          return;
        }
        setHasAccess(true);
      } catch (err) {
        console.log("Fetch channel error:", err);
      }
    };

    fetchChannelInfo();

    // Join channel in database
    const joinChannel = async () => {
      try {
        await API.post(
          `/channels/${activeChannel}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Joined channel in DB");
      } catch (err) {
        console.log("Join channel error:", err);
      }
    };

    if (hasAccess) {
      joinChannel();
      setMessages([]);
      setHasMore(true);
      loadLatestMessages();
    }
  }, [activeChannel]);

  // -----------------------------------
  // Scroll Listener
  // -----------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && hasMore) {
        loadOlderMessages();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages, hasMore]);

  // -----------------------------------
  // Real-Time Events (Join, Message, Typing)
  // -----------------------------------
  useEffect(() => {
    if (!activeChannel) return;

    // Join channel
    socket.emit("joinChannel", {
      channelId: activeChannel,
      userId: user.id,
    });

    // Receive new messages
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 20);
    });

    // Someone is typing
    socket.on("userTyping", (uid) => {
      setTypingUsers((prev) => {
        if (prev.includes(uid)) return prev;
        return [...prev, uid];
      });
    });

    // Someone stopped typing
    socket.on("userStoppedTyping", (uid) => {
      setTypingUsers((prev) => prev.filter((id) => id !== uid));
    });

    // Message edited
    socket.on("messageEdited", (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
    });

    // Message deleted
    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    });

    return () => {
      socket.emit("leaveChannel", {
        channelId: activeChannel,
        userId: user.id,
      });

      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageEdited");
      socket.off("messageDeleted");
    };
  }, [activeChannel]);

  // -----------------------------------
  // Search Messages
  // -----------------------------------
  const handleSearch = async () => {
    if (!searchText.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      const res = await API.get(
        `/messages/search/${activeChannel}?q=${searchText}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSearchResults(res.data);
      setIsSearching(true);
    } catch (err) {
      console.log("Search error", err);
    }
  };

  const jumpToMessage = (msgId) => {
    setTimeout(() => {
      const el = document.getElementById(msgId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);

    setIsSearching(false);
    setSearchText("");
  };

  // -----------------------------------
  // UI
  // -----------------------------------
  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center text-xl">
        Select a channel to start chatting
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-2">🔒 Private Channel</p>
          <p className="text-gray-400">You don't have access to this private channel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="
          px-5 py-3 border-b border-gray-300 dark:border-gray-600 
          font-semibold text-lg tracking-wide bg-white dark:bg-gray-700
          flex items-center justify-between
        "
      >
        <span># Channel</span>

        {/* Invite Button (only for private channels where user is member) */}
        {channelInfo?.isPrivate && hasAccess && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="
              px-3 py-1 text-sm bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-all
            "
            title="Invite users to this private channel"
          >
            + Invite
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-gray-800 flex items-center gap-2 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white outline-none"
        />

        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 max-h-48 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-gray-400 text-sm">No results found.</p>
          ) : (
            searchResults.map((msg) => (
              <div
                key={msg._id}
                className="p-2 hover:bg-gray-700 cursor-pointer rounded mb-1"
                onClick={() => jumpToMessage(msg._id)}
              >
                <p className="text-sm font-semibold text-blue-400">
                  {msg.senderId?.name || "User"}
                </p>
                <p className="text-gray-300 text-sm truncate">{msg.text}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-700 dark:bg-gray-700">
        {messages.map((msg) => (
          <MessageItem
            key={msg._id}
            message={msg}
            onProfileClick={(uid) => setProfileUserId(uid)}
          />
        ))}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-sm text-gray-600 dark:text-gray-300">
          {typingUsers
            .filter((uid) => uid !== user.id)
            .map((uid) => userCache[uid] || "User")
            .join(", ")}{" "}
          is typing...
        </div>
      )}

      {/* Input */}
      <MessageInput channelId={activeChannel} userId={user.id} />

      {/* Profile Popup */}
      {profileUserId && (
        <UserProfilePopup
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}

      {/* Invite Modal */}
      <InviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        channelId={activeChannel}
        currentMembers={channelInfo?.members || []}
      />
    </div>
  );
}
