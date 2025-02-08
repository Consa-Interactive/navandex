"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Package,
  User,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import Cookies from "js-cookie";
import Image from "next/image";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => Promise<void>;
}

export default function AddOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: AddOrderModalProps) {
  const { user } = useApp();
  const isAdminOrWorker = user?.role === "ADMIN" || user?.role === "WORKER";
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ id: number; name: string; phoneNumber: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    productLink: "",
    title: "",
    size: "",
    color: "",
    quantity: 1,
    notes: "",
    customer: "",
  });
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);

  useEffect(() => {
    if (isAdminOrWorker && searchTerm) {
      const fetchCustomers = async () => {
        try {
          const token = Cookies.get("token");
          const response = await fetch(
            `/api/users?role=CUSTOMER&search=${searchTerm}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setCustomers(data.users);
            setIsDropdownOpen(true);
          }
        } catch (error) {
          console.error("Failed to fetch customers:", error);
        }
      };

      const timer = setTimeout(fetchCustomers, 300);
      return () => clearTimeout(timer);
    } else {
      setCustomers([]);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, isAdminOrWorker]);

  useEffect(() => {
    if (!formData.productLink) return;

    const timer = setTimeout(async () => {
      try {
        setIsScrapingLoading(true);
        const response = await fetch("/api/scraper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: formData.productLink }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setFormData((prev) => ({
              ...prev,
              title: data.title,
            }));
          }
          if (data.images && data.images.length > 0) {
            setUploadedImage(data.images[0]);
          }
        }
      } catch (error) {
        console.error("Error scraping product:", error);
      } finally {
        setIsScrapingLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.productLink]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes("image")) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const data = await response.json();
          setUploadedImage(data.url);
        } catch (error) {
          console.error("Upload error:", error);
          setError("Failed to upload image");
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setUploadedImage(data.url);
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productLink.trim()) {
      setError("Product link is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productLink: formData.productLink,
          title: formData.title || "",
          size: formData.size || "",
          color: formData.color || "",
          quantity: Number(formData.quantity) || 1,
          notes: formData.notes || "",
          imageUrl: uploadedImage || "",
          userId: isAdminOrWorker ? Number(formData.customer) : user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      setShowSuccess(true);
      setTimeout(async () => {
        setShowSuccess(false);
        onClose();
        await onOrderCreated();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Order Created Successfully!
            </motion.h2>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Order</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Package className="w-4 h-4" />
                  Product Details
                </h3>

                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadedImage ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={uploadedImage}
                          alt="Product"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Drag and drop your image here, or{" "}
                          <label className="text-primary hover:text-primary-dark cursor-pointer">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Product Link */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Product Link
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="productLink"
                        value={formData.productLink}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="https://example.com/product"
                      />
                      {isScrapingLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Product Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Enter product title"
                    />
                  </div>

                  {/* Size and Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="e.g. XL, 42, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="e.g. Red, Blue, etc."
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Customer Info Section (Only for Admin/Worker) */}
              {isAdminOrWorker && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Search Customer
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Search by name or phone number"
                      />
                      {isDropdownOpen && customers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                          {customers.map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customer: customer.id.toString(),
                                }));
                                setSearchTerm(
                                  `${customer.name} (${customer.phoneNumber})`
                                );
                                setIsDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {customer.phoneNumber}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark active:bg-primary-darker rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                >
                  {loading ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
