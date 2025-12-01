import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="
      w-full h-14 px-6 
      bg-gray-900 dark:bg-gray-800 
      flex items-center justify-between 
      shadow-md border-b border-gray-700
    ">
      {/* Left Side Title */}
      <h1 className="text-xl font-bold text-white tracking-wide">
        Team Chat App
      </h1>

      {/* Right Side User Info */}
      <div className="flex items-center gap-4">

        {/* Username Badge */}
        <span className="text-gray-200 font-medium text-sm bg-gray-700 px-3 py-1 rounded-lg">
          {user?.name}
        </span>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
