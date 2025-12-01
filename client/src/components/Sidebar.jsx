import { useEffect, useState } from "react";
import ChannelItem from "./ChannelItem";
import API from "../api/api";
import CreateChannelModal from "./CreateChannelModal";

export default function Sidebar({ activeChannel, setActiveChannel, refreshRequest }) {
  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // --------------------------
  // Fetch channels
  // --------------------------
  const loadChannels = async () => {
    try {
      const res = await API.get("/channels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChannels(res.data);
      console.log("Channels loaded:", res.data);
    } catch (err) {
      console.log("Error fetching channels:", err);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  // --------------------------
  // Refresh when parent requests it
  // --------------------------
  useEffect(() => {
    if (refreshRequest) {
      loadChannels();
    }
  }, [refreshRequest]);

  // --------------------------
  // After creating a channel
  // --------------------------
  const handleChannelCreated = (newChannel) => {
    loadChannels(); // refresh list so memberCount appears
    setActiveChannel(newChannel._id); // auto-select new channel
  };

  return (
    <div className="h-full p-2 flex flex-col bg-gray-800 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-2 text-white">Channels</h2>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {channels
          .filter(ch => !ch.isPrivate || (ch.members && ch.members.includes(user.id)))
          .map((ch) => (
            <ChannelItem
              key={ch._id}
              channel={ch}
              activeChannel={activeChannel}
              setActiveChannel={setActiveChannel}
            />
          ))}
      </div>

      {/* Open Modal Button */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + Create Channel
      </button>

      {/* Modal */}
      <CreateChannelModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleChannelCreated}
      />
    </div>
  );
}
