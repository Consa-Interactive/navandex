"use client";

import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="min-h-screen">
        <div className="p-3 lg:p-4">{children}</div>
      </main>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-4">
          <Image
            src="/logo.png"
            alt="Navand Express"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-white">Navand</span>
            <span className="text-sm text-gray-400">Express</span>
          </div>
        </div>

        {/* Rest of the sidebar content ... */}
      </aside>
    </div>
  );
}
