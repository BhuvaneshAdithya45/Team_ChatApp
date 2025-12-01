import { useEffect, useState } from "react";
import API from "../api/api";

export default function InviteModal({ show, onClose, channelId, currentMembers }) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Load all users
  useEffect(() => {
    if (!show) return;

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/all", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filter out current user and existing members
        const available = res.data.filter(
          (u) => u._id !== user.id && !currentMembers.includes(u._id)
        );

        setAllUsers(available);
      } catch (err) {
        console.log("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [show, currentMembers, token, user.id]);

  // Toggle user selection
  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Send invites
  const inviteUsers = async () => {
    if (selectedUsers.length === 0) {
      alert("Select at least one user");
      return;
    }

    setLoading(true);

    try {
      // Invite each selected user
      await Promise.all(
        selectedUsers.map((userId) =>
          API.post(
            "/channels/invite/user",
            { channelId, userId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      alert("Users invited successfully!");
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      alert("Failed to invite users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="
      fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm 
      flex items-center justify-center z-50
    ">
      <div className="
        bg-white dark:bg-gray-800 p-6 rounded-xl w-96 max-h-96 
        shadow-xl flex flex-col
      ">
        <h2 className="text-xl font-semibold mb-4">Invite Users</h2>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-2 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          {allUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No users available to invite</p>
          ) : (
            allUsers.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{u.name}</span>
                <span className="text-xs text-gray-500">({u.email})</span>
              </label>
            ))
          )}
        </div>

        {/* Action Buttons */}
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
            onClick={inviteUsers}
            disabled={loading || selectedUsers.length === 0}
            className="
              px-4 py-2 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 disabled:bg-gray-400 
              transition-all disabled:cursor-not-allowed
            "
          >
            {loading ? "Inviting..." : `Invite (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
