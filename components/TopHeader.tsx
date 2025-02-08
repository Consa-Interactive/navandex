import { Bell, Sun, Moon, User, LogOut, Settings } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function TopHeader() {
  const { user, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 lg:px-8">
      <div className="flex items-center space-x-2">
        {/* TODO: Later we can add logo here */}
      </div>
      {/* Right Side Icons */}
      <div className="flex items-center space-x-1 lg:space-x-2">
        <button className="p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 relative group">
          <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 lg:top-1.5 right-1 lg:right-1.5 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full"></span>
          <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 lg:px-2 py-0.5 bg-primary rounded-full text-[8px] lg:text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
            3
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div
          className="pl-1 lg:pl-2 border-l border-gray-200 dark:border-gray-700 ml-1 lg:ml-2"
          ref={dropdownRef}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name}
              </p>
              <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                {user?.role}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 right-2 mt-1 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              <Link
                href="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
