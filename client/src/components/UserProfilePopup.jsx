import { useContext } from "react";
import { UserCacheContext } from "../context/UserCacheContext";

export default function UserProfilePopup({ userId, onClose }) {
  const { userCache, fullUserData } = useContext(UserCacheContext);

  if (!userId) return null;

  // If full user details are cached (optional future)
  const user = fullUserData?.[userId] || {};

  return (
    <div
      className="
        fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm 
        flex items-center justify-center z-50
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white dark:bg-gray-800 p-6 rounded-xl w-80 shadow-xl 
          animate-fadeIn transform transition-all
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {userCache[userId] || "User"}
        </h2>

        <div className="space-y-2 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {user.email || "N/A"}
          </p>

          <p className="text-gray-700 dark:text-gray-300">
            <strong>Status:</strong>{" "}
            <span className="text-green-500">Online</span>
          </p>

          <p className="text-gray-700 dark:text-gray-300">
            <strong>User ID:</strong> {userId}
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            mt-4 w-full py-2 bg-blue-600 text-white 
            rounded-lg hover:bg-blue-700 transition-all
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}
