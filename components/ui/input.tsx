export function Input({ type = "text", className = "", ...props }) {
  return (
    <input
      type={type}
      className={`w-full px-4 py-3 border border-gray-200 bg-white rounded-lg placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200 shadow-sm hover:shadow-md ${className}`}
      {...props}
    />
  );
}