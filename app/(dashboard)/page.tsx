"use client";

import { useApp } from "@/providers/AppProvider";
import Stats from "@/components/dashboard/Stats";
import StatsSkeleton from "@/components/dashboard/StatsSkeleton";
import BannerSkeleton from "@/components/dashboard/BannerSkeleton";
import Announcements from "@/components/dashboard/Announcements";
import RecentOrders from "@/components/dashboard/RecentOrders";
import { Plus, Package, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BannerSlider from "@/components/dashboard/BannerSlider";
import AddOrderModal from "@/components/orders/AddOrderModal";
import { useState, useEffect } from "react";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link?: string | null;
}

export default function DashboardPage() {
  const { user, logout } = useApp();
  const router = useRouter();
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (!response.ok) throw new Error("Failed to fetch banners");
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Mobile Header (Stacked) */}
      <div className="flex flex-col space-y-4 lg:hidden">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your orders
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Package className="h-4 w-4" />
            My Orders
          </Link>
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90"
          >
            <Plus className="h-4 w-4" />
            Add Order
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop Header (Horizontal) */}
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Package className="h-4 w-4" />
            My Orders
          </Link>
          <button
            onClick={() => setIsAddOrderModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90"
          >
            <Plus className="h-4 w-4" />
            Add Order
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        {/* Banner Carousel */}
        {isLoading ? (
          <BannerSkeleton />
        ) : (
          banners.length > 0 && <BannerSlider banners={banners as []} />
        )}
      </div>

      {isLoading ? <StatsSkeleton /> : <Stats />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Announcements />
        <RecentOrders />
      </div>

      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onClose={() => setIsAddOrderModalOpen(false)}
        onOrderCreated={async () => {
          setIsAddOrderModalOpen(false);
          await router.refresh();
        }}
      />
    </div>
  );
}
