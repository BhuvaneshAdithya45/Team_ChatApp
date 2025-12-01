import { useState } from "react";
import API from "../api/api";

export default function CreateChannelModal({ show, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const token = localStorage.getItem("token");

  const createChannel = async () => {
    if (!name.trim()) return;

    try {
      const res = await API.post(
        "/channels",
        { name, isPrivate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onCreated(res.data); // pass channel back
      onClose();
      setName("");
      setIsPrivate(false);

    } catch (err) {
      alert("Channel already exists or unable to create channel.");
    }
  };

  if (!show) return null;

  return (
    <div className="
      fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm 
      flex items-center justify-center z-50
    ">
      <div
        className="
          bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-xl 
          animate-fadeIn scale-95 transform transition-all
        "
      >
        <h2 className="text-xl font-semibold mb-4">Create Channel</h2>

        <input
          type="text"
          placeholder="Channel name"
          className="
            w-full p-3 bg-gray-100 dark:bg-gray-700 
            rounded-lg mb-4 outline-none border 
            border-gray-300 dark:border-gray-600
            focus:ring-2 focus:ring-blue-500 transition
          "
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="private" className="text-sm dark:text-gray-300">
            Make this channel private
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              px-4 py-2 bg-gray-500 text-white rounded-lg
              hover:bg-gray-600 transition-all
            "
          >
            Cancel
          </button>

          <button
            onClick={createChannel}
            className="
              px-4 py-2 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 shadow-md transition-all
            "
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
