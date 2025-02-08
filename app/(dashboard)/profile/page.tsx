"use client";

import { useEffect, useState } from "react";
import {
  User,
  Shield,
  Camera,
  Lock,
  Bell,
  Edit3,
  Package,
  Clock,
  ChevronRight,
  Truck,
  MapPin,
  Heart,
  Star,
  Settings,
} from "lucide-react";
import Cookies from "js-cookie";
import { useApp } from "@/providers/AppProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStats {
  totalOrders: number;
  deliveredOrders: number;
  savedAddresses: number;
  wishlistItems: number;
}

interface UserInfo {
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  role: string;
  isActive: boolean;
}

interface RecentOrder {
  id: number;
  title: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

interface ProfileData {
  stats: UserStats;
  userInfo: UserInfo;
  recentOrders: RecentOrder[];
}

export default function ProfilePage() {
  const { user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (data?.userInfo) {
      setFormData({
        address: data.userInfo.address || "",
        city: data.userInfo.city || "",
        country: data.userInfo.country || "",
      });
    }
  }, [data?.userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = Cookies.get("token");
      if (!token || !user?.id) return;

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Refresh the profile data
      const statsResponse = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) {
        throw new Error("Failed to refresh profile data");
      }

      const newData = await statsResponse.json();
      setData(newData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const response = await fetch("/api/user/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch profile data");

        const profileData = await response.json();
        setData(profileData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Header Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-11 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4"
                  >
                    <Skeleton className="w-8 h-8 rounded-xl mb-3" />
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-xl" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-3.5 h-3.5" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Skeleton className="h-4 w-16 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6 lg:mt-0 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 relative">
            <button className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all duration-200 backdrop-blur-sm flex items-center gap-2 hover:gap-3 group">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">Change Cover</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:-mt-20 gap-6">
              {/* Avatar */}
              <div className="relative flex-none">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 overflow-hidden">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                  </div>
                </div>
                <button className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gray-900/60 hover:bg-gray-900/80 text-white transition-all duration-200 backdrop-blur-sm">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                    {data.userInfo.role}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleUpdateProfile();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:hover:text-white transition-all duration-200 gap-2 group"
                  >
                    <Edit3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Status
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Account Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {data.userInfo.role.toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        data.userInfo.isActive
                          ? "bg-green-500"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.userInfo.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(data.userInfo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Account Statistics
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.totalOrders}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Orders
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.deliveredOrders}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delivered
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.savedAddresses}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saved Address
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.stats.wishlistItems}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Wishlist
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Actions
              </h2>
              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Lock className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Change Password</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Bell className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Notification Settings</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Shield className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Privacy Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    disabled={!isEditing}
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    disabled={!isEditing}
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Recent Orders
                </h2>
                <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                  View All Orders
                </button>
              </div>

              <div className="space-y-4">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Order #{order.id}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${order.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.items} items
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-green-500"
                                : order.status === "PROCESSING"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300 lg:block hidden">
                            {order.status}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
