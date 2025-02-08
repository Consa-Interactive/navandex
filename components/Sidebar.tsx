"use client";

import { useApp } from "@/providers/AppProvider";
import {
  Home,
  Users,
  Package,
  ChevronRight,
  User,
  BarChart2,
  Megaphone,
  Image,
  DollarSign,
  ChevronDown,
  Scan,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NextImg from "next/image";

interface SidebarProps {
  onMobileClose?: () => void;
}

type MenuSubItem = {
  icon?: React.ComponentType<Record<string, unknown>>;
  label: string;
  href: string;
};

type MenuItem = {
  name: string;
  items: (
    | MenuSubItem
    | {
        icon: React.ComponentType<Record<string, unknown>>;
        label: string;
        href?: string;
        subItems?: MenuSubItem[];
      }
  )[];
};

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const isAdminOrWorker = user?.role === "ADMIN" || user?.role === "WORKER";

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const menuCategories: MenuItem[] = [
    {
      name: "MAIN",
      items: [
        { icon: Home, label: "Dashboard", href: "/" },
        isAdminOrWorker
          ? {
              icon: Package,
              label: "Orders",
              subItems: [
                { label: "All Orders", href: "/orders" },
                { label: "Active Orders", href: "/orders?status=active" },
                { label: "Passive Orders", href: "/orders?status=passive" },
                { label: "Turkey", href: "/orders?country=turkey" },
                { label: "United States", href: "/orders?country=usa" },
                { label: "UAE", href: "/orders?country=uae" },
                { label: "United Kingdom", href: "/orders?country=uk" },
                { label: "China", href: "/orders?country=china" },
                { label: "Europe", href: "/orders?country=europe" },
              ],
            }
          : { icon: Package, label: "My Orders", href: "/orders" },
      ].filter(Boolean),
    },
    ...(isAdminOrWorker
      ? [
          {
            name: "MANAGEMENT",
            items: [
              { icon: Users, label: "Customers", href: "/users" },
              {
                icon: Megaphone,
                label: "Announcements",
                href: "/announcements",
              },
              {
                icon: Image,
                label: "Banners",
                href: "/banners",
              },
              {
                icon: BarChart2,
                label: "Reports",
                href: "/reports",
              },
              {
                icon: DollarSign,
                label: "Exchange Rates",
                href: "/exchange-rates",
              },
              {
                icon: Scan,
                label: "Scan",
                href: "/scan",
              },
            ],
          },
        ]
      : []),
    {
      name: "TOOLS",
      items: [
        { icon: BarChart2, label: "My Stats", href: "/stats" },
        { icon: User, label: "Profile", href: "/profile" },

        // TODO: Remove this section
        // { icon: Settings, label: "Settings", href: "/settings" },
      ],
    },
  ];

  if (!isMounted) return null;

  return (
    <nav className="print:hidden relative flex h-full flex-col bg-gray-900 text-gray-200">
      {/* Logo Section with enhanced styling */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h1 className="flex items-center text-xl font-bold">
          {/** TODO: Remove this section */}
          <span className="mr-2 rounded-xl  p-[1.5px] text-white">
            <NextImg
              src="/logo_dark.png"
              width={125}
              height={125}
              alt={"Navand Logo"}
            />
          </span>
          <span className="font-extrabold">Navand Express</span>
        </h1>
      </div>

      {/* Menu Categories */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700/30 hover:scrollbar-thumb-gray-700/50">
          <div className="py-4">
            {menuCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-4">
                <h2 className="mb-2 px-6 text-[11px] font-medium uppercase tracking-wider text-gray-500/80">
                  {category.name}
                </h2>
                {category.items.map((item, itemIndex) => {
                  const isDropdown = "subItems" in item;
                  const isActive = isDropdown
                    ? item.subItems?.some(
                        (subItem) => pathname === subItem.href
                      )
                    : pathname === item.href;
                  const isExpanded = expandedMenus.includes(item.label);

                  return (
                    <div key={itemIndex}>
                      {isDropdown ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={`group relative mx-3 flex w-[calc(100%-24px)] items-center justify-between rounded-xl px-4 py-2 transition-all duration-200
                              ${
                                isActive
                                  ? "bg-gray-800/90 text-white"
                                  : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`rounded-xl transition-transform group-hover:scale-105 ${
                                  isActive ? "text-primary" : ""
                                }`}
                              >
                                <item.icon className={`h-[18px] w-[18px]`} />
                              </div>
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isExpanded && (
                            <div className="mt-1 space-y-1 pl-12 pr-3">
                              {item.subItems?.map((subItem, subIndex) => {
                                const isSubItemActive =
                                  pathname === subItem.href;
                                return (
                                  <Link
                                    key={subIndex}
                                    href={subItem.href}
                                    onClick={onMobileClose}
                                    className={`block rounded-xl px-4 py-2 text-[13px] transition-colors ${
                                      isSubItemActive
                                        ? "bg-gray-800/90 text-white"
                                        : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                                    }`}
                                  >
                                    {subItem.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href!}
                          onClick={onMobileClose}
                          className={`group relative mx-3 flex items-center rounded-xl px-4 py-2 transition-all duration-200
                            ${
                              isActive
                                ? "bg-gray-800/90 text-white"
                                : "text-gray-400 hover:bg-gray-800/40 hover:text-white"
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`rounded-xl transition-transform group-hover:scale-105 ${
                                isActive ? "text-primary" : ""
                              }`}
                            >
                              {item.icon && (
                                <item.icon className={`h-[18px] w-[18px]`} />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight
                            className={`absolute right-2 h-4 w-4 transform transition-all duration-200
                              ${
                                isActive
                                  ? "text-primary opacity-100"
                                  : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                              }`}
                          />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Account Section with glass effect */}
      <div className="mt-auto border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-3 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800/80 ring-2 ring-gray-700/50">
              <User className="h-[18px] w-[18px] text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{user?.name}</p>
              <p className="text-[11px] text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
