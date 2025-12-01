export default function ChannelItem({ channel, activeChannel, setActiveChannel }) {
  const isActive = activeChannel === channel._id;

  return (
    <div
      onClick={() => setActiveChannel(channel._id)}
      className={`
        p-1.5 rounded-lg cursor-pointer flex justify-between items-center
        transition-all duration-200 select-none
        ${isActive 
          ? "bg-blue-500 text-white shadow-md" 
          : "hover:bg-gray-200 dark:hover:bg-gray-600"
        }
      `}
    >
      <span className="font-medium text-sm"># {channel.name}</span>

      <div className="flex items-center gap-1">
        {channel.isPrivate && <span className="text-xs">🔒</span>}
        <span className={`text-xs ${isActive ? "text-gray-200" : "text-gray-600 dark:text-gray-300"}`}>
          {channel.memberCount}
        </span>
      </div>
    </div>
  );
}
