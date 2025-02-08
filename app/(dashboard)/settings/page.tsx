"use client";

import {
  Bell,
  Lock,
  Shield,
  Sun,
  Globe,
  Mail,
  Phone,
  Smartphone,
  BellRing,
  BellOff,
  Eye,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    newsAndOffers: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showPhone: false,
    showAddress: false,
  });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column - Navigation */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <nav className="space-y-2">
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 text-left flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 text-left flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>Security</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 text-left flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span>Privacy</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 text-left flex items-center gap-3">
                  <Globe className="w-4 h-4" />
                  <span>Language & Region</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 text-left flex items-center gap-3">
                  <Sun className="w-4 h-4" />
                  <span>Appearance</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Right Column - Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage how you receive notifications and updates.
              </p>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailNotifications: !prev.emailNotifications,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      notifications.emailNotifications
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        notifications.emailNotifications ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive push notifications on your device
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        pushNotifications: !prev.pushNotifications,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      notifications.pushNotifications
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        notifications.pushNotifications ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BellRing className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Order Updates
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get notified about your order status
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        orderUpdates: !prev.orderUpdates,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      notifications.orderUpdates
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        notifications.orderUpdates ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BellOff className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        News and Offers
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive updates about promotions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        newsAndOffers: !prev.newsAndOffers,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      notifications.newsAndOffers
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        notifications.newsAndOffers ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy Settings
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Control your privacy preferences and data visibility.
              </p>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Profile Visibility
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Control who can see your profile
                      </p>
                    </div>
                  </div>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        profileVisibility: e.target.value,
                      }))
                    }
                    className="px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="contacts">Contacts Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Show Phone Number
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Display your phone number to other users
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPrivacy((prev) => ({
                        ...prev,
                        showPhone: !prev.showPhone,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      privacy.showPhone
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        privacy.showPhone ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Show Address
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Display your address to other users
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setPrivacy((prev) => ({
                        ...prev,
                        showAddress: !prev.showAddress,
                      }))
                    }
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                      privacy.showAddress
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform duration-200 ${
                        privacy.showAddress ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
