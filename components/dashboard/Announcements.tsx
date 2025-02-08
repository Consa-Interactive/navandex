"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  X,
  ChevronRight,
  Bell,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: "INFO" | "UPDATE" | "ALERT";
  isImportant: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
}

type AnnouncementCategory = "INFO" | "UPDATE" | "ALERT";

export default function Announcements() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isImportant: false,
    category: "INFO" as AnnouncementCategory,
    expiresAt: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements?limit=5");
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getCategoryStyles = (category?: "INFO" | "UPDATE" | "ALERT") => {
    switch (category) {
      case "INFO":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "UPDATE":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "ALERT":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create announcement");
      }

      const announcement = await response.json();

      // Update announcements list while maintaining 5 items limit
      setAnnouncements((prev) => {
        const updatedList = [announcement, ...prev];
        // Only keep the first 5 announcements
        return updatedList.slice(0, 5);
      });

      setNewAnnouncement({
        title: "",
        content: "",
        isImportant: false,
        category: "INFO" as AnnouncementCategory,
        expiresAt: "",
      });
      setIsCreateModalOpen(false);
      toast.success("Announcement created successfully");
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Announcements
            </h2>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Announcements
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <AnimatePresence initial={false}>
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group relative cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-primary dark:border-gray-700 dark:bg-gray-700/50"
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <div className="flex gap-2">
                      {announcement.isImportant && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          Important
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryStyles(
                          announcement.category
                        )}`}
                      >
                        {announcement.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      {formatDate(announcement.createdAt)} by{" "}
                      {announcement.createdBy.name}
                    </span>
                    {announcement.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {formatDate(announcement.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-12 dark:bg-gray-700/50">
            <Megaphone className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No announcements yet
            </p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setIsCreateModalOpen(false)}
        open={isCreateModalOpen}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Announcement
              </Dialog.Title>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Content
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter announcement content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Category
                </label>
                <select
                  value={newAnnouncement.category}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      category: e.target.value as "INFO" | "UPDATE" | "ALERT",
                    }))
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                >
                  <option value="INFO">Information</option>
                  <option value="UPDATE">Update</option>
                  <option value="ALERT">Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={newAnnouncement.isImportant}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      isImportant: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isImportant"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  Mark as important
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnnouncement}
                disabled={!newAnnouncement.title || !newAnnouncement.content}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* View Announcement Modal */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setSelectedAnnouncement(null)}
        open={!!selectedAnnouncement}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            {selectedAnnouncement && (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedAnnouncement.title}
                    </Dialog.Title>
                    <div className="mt-1 flex gap-2">
                      {selectedAnnouncement.isImportant && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          Important
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryStyles(
                          selectedAnnouncement.category
                        )}`}
                      >
                        {selectedAnnouncement.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedAnnouncement.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Bell className="h-4 w-4" />
                      Posted: {formatDate(
                        selectedAnnouncement.createdAt
                      )} by {selectedAnnouncement.createdBy.name}
                    </span>
                    {selectedAnnouncement.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Expires: {formatDate(selectedAnnouncement.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
