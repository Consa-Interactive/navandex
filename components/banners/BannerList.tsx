"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import ImageInput from "@/components/ui/ImageInput";
import BannerListSkeleton from "./BannerListSkeleton";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link?: string | null;
  isActive: boolean;
  order: number;
}

export default function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    isActive: true,
  });

  // Fetch banners
  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      const res = await fetch("/api/banners", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load banners");

      const data = await res.json();
      setBanners(data);
    } catch (err) {
      toast.error("Could not load banners");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Banner actions
  async function saveBanner(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const isEditing = !!editingBanner;
      const url = isEditing
        ? `/api/banners/${editingBanner.id}`
        : "/api/banners";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          isEditing ? { ...editingBanner } : { ...form, order: banners.length }
        ),
      });

      if (!res.ok) throw new Error();

      await loadBanners();
      closeModal();
      toast.success(isEditing ? "Banner updated" : "Banner created");
    } catch {
      const message = editingBanner
        ? "Failed to update banner"
        : "Failed to create banner";
      toast.error(message);
    }
  }

  async function deleteBanner(id: number) {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      await loadBanners();
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  }

  async function moveBanner(id: number, direction: "up" | "down") {
    const index = banners.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === banners.length - 1)
    )
      return;

    try {
      const token = Cookies.get("token");
      const newOrder =
        direction === "up"
          ? banners[index - 1].order
          : banners[index + 1].order;

      const res = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!res.ok) throw new Error();

      await loadBanners();
    } catch {
      toast.error("Failed to move banner");
    }
  }

  async function toggleActive(banner: Banner) {
    try {
      const token = Cookies.get("token");
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (!res.ok) throw new Error();

      await loadBanners();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  // Modal helpers
  function openCreateModal() {
    setEditingBanner(null);
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      isActive: true,
    });
    setShowModal(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingBanner(null);
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      isActive: true,
    });
  }

  if (isLoading) {
    return <BannerListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your homepage banners
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        // Loading state
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative aspect-[16/9] animate-pulse bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-2/3 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        // Empty state
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No banners yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new banner
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          </div>
        </div>
      ) : (
        // Banner grid
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Banner image */}
              <div className="relative aspect-[16/9]">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Banner content */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveBanner(banner.id, "up")}
                      disabled={banner.order === 0}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveBanner(banner.id, "down")}
                      disabled={banner.order === banners.length - 1}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {banner.description}
                </p>

                {banner.link && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{banner.link}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleActive(banner)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      banner.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={closeModal}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingBanner ? "Edit Banner" : "Create Banner"}
              </Dialog.Title>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveBanner} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  value={editingBanner?.title ?? form.title}
                  onChange={(e) =>
                    editingBanner
                      ? setEditingBanner({
                          ...editingBanner,
                          title: e.target.value,
                        })
                      : setForm({ ...form, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description
                </label>
                <input
                  type="text"
                  value={editingBanner?.description ?? form.description}
                  onChange={(e) =>
                    editingBanner
                      ? setEditingBanner({
                          ...editingBanner,
                          description: e.target.value,
                        })
                      : setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Banner Image
                </label>
                <ImageInput
                  value={editingBanner?.imageUrl ?? form.imageUrl}
                  onChange={(url: string) =>
                    editingBanner
                      ? setEditingBanner({ ...editingBanner, imageUrl: url })
                      : setForm({ ...form, imageUrl: url })
                  }
                  className="mt-1"
                  height="min-h-[240px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={editingBanner?.link ?? form.link}
                  onChange={(e) =>
                    editingBanner
                      ? setEditingBanner({
                          ...editingBanner,
                          link: e.target.value,
                        })
                      : setForm({ ...form, link: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner link"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingBanner?.isActive ?? form.isActive}
                  onChange={(e) =>
                    editingBanner
                      ? setEditingBanner({
                          ...editingBanner,
                          isActive: e.target.checked,
                        })
                      : setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  Active
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90"
                >
                  {editingBanner ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
