"use client";

import { useRouter } from "next/navigation";
import { FiLogOut, FiBarChart2, FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";

interface HeaderProps {
  onShowStats: () => void;
}

export default function Header({ onShowStats }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("supportUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("supportToken");
    localStorage.removeItem("supportUser");
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🏠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Support Dashboard</h1>
            <p className="text-xs text-gray-500">Real Estate Messaging System</p>
          </div>
        </div>

        <nav className="flex space-x-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Live Chat
          </button>
          <button
            onClick={() => router.push("/dashboard/tickets")}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Tickets
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onShowStats}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiBarChart2 />
          <span className="text-sm font-medium">Statistics</span>
        </button>

        <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.[0] || "Support"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiLogOut />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
}
