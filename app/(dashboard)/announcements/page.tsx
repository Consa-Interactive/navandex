"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Bell,
  AlertCircle,
  Trash2,
  Edit,
  X,
  User,
} from "lucide-react";
import { Dialog, Tab } from "@headlessui/react";
import Cookies from "js-cookie";
import { useApp } from "@/providers/AppProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: "INFO" | "UPDATE" | "ALERT";
  isImportant: boolean;
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
  createdBy: {
    name: string;
    role: string;
  };
}

type Filter = "all" | "active" | "expired" | "important";
type Category = "all" | "INFO" | "UPDATE" | "ALERT";

export default function AnnouncementsPage() {
  const { user } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>(
    {
      title: "",
      content: "",
      isImportant: false,
      category: "INFO" as const,
      expiresAt: "",
    }
  );

  const fetchAnnouncements = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/announcements?includeInactive=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch announcements");
      }

      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load announcements"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAnnouncements();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = () => {
      switch (selectedFilter) {
        case "active":
          return (
            announcement.isActive &&
            (!announcement.expiresAt ||
              new Date(announcement.expiresAt) > new Date())
          );
        case "expired":
          return (
            !announcement.isActive ||
            (announcement.expiresAt &&
              new Date(announcement.expiresAt) <= new Date())
          );
        case "important":
          return announcement.isImportant;
        default:
          return true;
      }
    };

    const matchesCategory =
      selectedCategory === "all" || announcement.category === selectedCategory;

    return matchesSearch && matchesFilter() && matchesCategory;
  });

  const handleCreateAnnouncement = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create announcement");
      }

      const announcement = await response.json();
      setAnnouncements((prev) => [announcement, ...prev]);
      setNewAnnouncement({
        title: "",
        content: "",
        isImportant: false,
        category: "INFO",
        expiresAt: "",
      });
      setIsCreateModalOpen(false);
      toast.success("Announcement created successfully");
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/announcements/${selectedAnnouncement.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete announcement");

      setAnnouncements((prev) =>
        prev.filter((a) => a.id !== selectedAnnouncement.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedAnnouncement(null);
      toast.success("Announcement deleted successfully");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/announcements/${selectedAnnouncement.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: selectedAnnouncement.title,
            content: selectedAnnouncement.content,
            category: selectedAnnouncement.category,
            isImportant: selectedAnnouncement.isImportant,
            expiresAt: selectedAnnouncement.expiresAt,
            isActive: selectedAnnouncement.isActive,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update announcement");

      const updated = await response.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setIsEditMode(false);
      toast.success("Announcement updated successfully");
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
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

  const getCategoryStyles = (category: string) => {
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your announcements
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90"
        >
          <Plus className="h-4 w-4" />
          Add Announcement
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
            />
          </div>
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {["all", "active", "expired", "important"].map((filter) => (
              <Tab
                key={filter}
                className={({ selected }) =>
                  cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    selected
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  )
                }
                onClick={() => setSelectedFilter(filter as Filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>

        <Tab.Group>
          <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {["all", "INFO", "UPDATE", "ALERT"].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    selected
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  )
                }
                onClick={() => setSelectedCategory(category as Category)}
              >
                {category === "all"
                  ? "All Categories"
                  : category.charAt(0) + category.slice(1).toLowerCase()}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-center">
            <Megaphone className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No announcements found
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((announcement) => (
              <motion.div
                key={announcement.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {announcement.title}
                      </h3>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {announcement.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setIsEditMode(true);
                      }}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setIsDeleteModalOpen(true);
                      }}
                      className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {formatDate(announcement.createdAt)}
                  </div>
                  {announcement.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      Expires {formatDate(announcement.expiresAt)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    By {(announcement.createdBy as {name: string}).name}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedAnnouncement(null);
          setIsEditMode(false);
        }}
        open={isCreateModalOpen || isEditMode}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Announcement" : "Create Announcement"}
              </Dialog.Title>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedAnnouncement(null);
                  setIsEditMode(false);
                }}
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
                  value={
                    isEditMode
                      ? selectedAnnouncement?.title
                      : newAnnouncement.title
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedAnnouncement({
                          ...selectedAnnouncement!,
                          title: e.target.value,
                        })
                      : setNewAnnouncement({
                          ...newAnnouncement,
                          title: e.target.value,
                        })
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
                  value={
                    isEditMode
                      ? selectedAnnouncement?.content
                      : newAnnouncement.content
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedAnnouncement({
                          ...selectedAnnouncement!,
                          content: e.target.value,
                        })
                      : setNewAnnouncement({
                          ...newAnnouncement,
                          content: e.target.value,
                        })
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
                  value={
                    isEditMode
                      ? selectedAnnouncement?.category
                      : newAnnouncement.category
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedAnnouncement({
                          ...selectedAnnouncement!,
                          category: e.target.value as
                            | "INFO"
                            | "UPDATE"
                            | "ALERT",
                        })
                      : setNewAnnouncement({
                          ...newAnnouncement,
                          category: e.target.value as
                            | "INFO"
                            | "UPDATE"
                            | "ALERT",
                        })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                >
                  <option value="INFO">Info</option>
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
                  value={
                    isEditMode
                      ? selectedAnnouncement?.expiresAt?.slice(0, 16) ?? ""
                      : newAnnouncement.expiresAt ?? ""
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedAnnouncement({
                          ...selectedAnnouncement!,
                          expiresAt: e.target.value,
                        })
                      : setNewAnnouncement({
                          ...newAnnouncement,
                          expiresAt: e.target.value,
                        })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={
                    isEditMode
                      ? selectedAnnouncement?.isImportant
                      : newAnnouncement.isImportant
                  }
                  onChange={(e) =>
                    isEditMode
                      ? setSelectedAnnouncement({
                          ...selectedAnnouncement!,
                          isImportant: e.target.checked,
                        })
                      : setNewAnnouncement({
                          ...newAnnouncement,
                          isImportant: e.target.checked,
                        })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isImportant"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  Mark as Important
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedAnnouncement(null);
                  setIsEditMode(false);
                }}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  isEditMode
                    ? handleUpdateAnnouncement()
                    : handleCreateAnnouncement()
                }
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isEditMode ? "Save Changes" : "Create"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setIsDeleteModalOpen(false)}
        open={isDeleteModalOpen}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Delete Announcement
              </Dialog.Title>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this announcement? This action
                cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAnnouncement}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
