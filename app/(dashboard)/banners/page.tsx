"use client";

import BannerList from "@/components/banners/BannerList";
import { useApp } from "@/providers/AppProvider";

export default function BannersPage() {
  const { user } = useApp();

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400">
          You don&apos;t have access to this page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <BannerList />
    </div>
  );
}
