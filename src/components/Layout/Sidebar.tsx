import React from "react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Clock,
  Armchair,
  CreditCard,
  BookOpen,
  X,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  activeTab,
  onTabChange,
  mobileOpen = false,
  onClose,
}: SidebarProps) => {
  const menuItems = [
    {id: "dashboard", label: "Dashboard", icon: LayoutDashboard},
    {id: "register", label: "Register Student", icon: UserPlus},
    {id: "students", label: "All Students", icon: Users},
    {id: "expiring", label: "Expiring Soon", icon: Clock},
    {id: "seats", label: "Seat Management", icon: Armchair},
    {id: "plans", label: "Plan Management", icon: CreditCard},
  ];

  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-72 md:w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-slate-800" />
          <h1 className="text-xl font-bold text-slate-800">NaiUdaan Library</h1>
        </div>
        {/* Close button on mobile */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    onClose && onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-slate-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
