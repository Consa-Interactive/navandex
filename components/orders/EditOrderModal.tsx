"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { X, Upload } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { Order } from "@prisma/client";
import { useApp } from "@/providers/AppProvider";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdated: () => Promise<void>;
}

interface FormData {
  title: string;
  size: string;
  color: string;
  quantity: string | number;
  price: number;
  shippingPrice: number;
  status: string;
  productLink: string;
  imageUrl: string;
  notes: string;
  orderNumber: string;
}

export default function EditOrderModal({
  isOpen,
  onClose,
  order,
}: EditOrderModalProps) {
  const { setOrderUpdates } = useApp();
  const initialFormData = useMemo(
    () => ({
      title: order.title || "",
      size: order.size || "",
      color: order.color || "",
      quantity: order.quantity,
      price: order.price,
      shippingPrice: order.shippingPrice || 0,
      status: order.status,
      productLink: order.productLink || "",
      imageUrl: order.imageUrl || "",
      notes: order.notes || "",
      orderNumber: order.orderNumber || "",
    }),
    [order]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form data when order changes
  useMemo(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

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
        await handleFileUpload(file);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.includes("image")) {
        await handleFileUpload(file);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log("=== Starting File Upload Process ===");
    console.log("Original Image URL:", formData.imageUrl);

    try {
      setLoading(true);

      // First, delete the old image if it exists and is from S3
      if (
        formData.imageUrl &&
        formData.imageUrl.includes("contabostorage.com")
      ) {
        console.log("Attempting to delete old image:", formData.imageUrl);
        try {
          const deleteResponse = await fetch("/api/upload", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: formData.imageUrl }),
          });

          console.log("Delete response status:", deleteResponse.status);
          if (!deleteResponse.ok) {
            console.error(
              "Failed to delete old image:",
              await deleteResponse.text()
            );
          } else {
            console.log("Old image deleted successfully");
          }
        } catch (error) {
          console.error("Error during image deletion:", error);
        }
      }

      // Then upload the new image
      console.log("Starting new image upload");
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload response error:", errorText);
        throw new Error("Failed to upload image");
      }

      const data = await uploadResponse.json();
      console.log("New image URL:", data.url);

      // Update form data with new image URL
      setFormData((prev) => {
        console.log("Updating form data with new image URL");
        console.log("Previous imageUrl:", prev.imageUrl);
        console.log("New imageUrl:", data.url);
        return {
          ...prev,
          imageUrl: data.url,
        };
      });
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image");
    } finally {
      setLoading(false);
      console.log("=== End File Upload Process ===");
      console.log("Final form data imageUrl:", formData.imageUrl);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setLoading(true);

      // Delete the image from S3 if it's a Contabo storage URL
      if (
        formData.imageUrl &&
        formData.imageUrl.includes("contabostorage.com")
      ) {
        const deleteResponse = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: formData.imageUrl }),
        });

        if (!deleteResponse.ok) {
          throw new Error("Failed to delete image");
        }
      }

      // Clear the image URL from form data
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity"
          ? value === ""
            ? ""
            : parseInt(value) || ""
          : name === "price" || name === "shippingPrice"
          ? parseFloat(parseFloat(value).toFixed(2)) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=== Starting Form Submission ===");
    console.log("Current form data:", formData);
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      // Convert quantity to number, default to 1 if empty or invalid
      const quantityValue =
        typeof formData.quantity === "string" && formData.quantity.trim() === ""
          ? 1
          : Number(formData.quantity) || 1;

      const requestBody = {
        ...formData,
        imageUrl: formData.imageUrl || null,
        quantity: quantityValue,
        price: Number(formData.price),
        shippingPrice: Number(formData.shippingPrice),
      };

      console.log("Sending request with body:", requestBody);

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update response error:", errorData);
        throw new Error(errorData.error || "Failed to update order");
      }

      const updatedOrder = await response.json();
      console.log("Updated order data:", updatedOrder);

      setShowSuccess(true);

      // Show success animation and refresh orders
      setTimeout(() => {
        setShowSuccess(false);
        setOrderUpdates((prev) => prev + 1);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setLoading(false);
      console.log("=== End Form Submission ===");
    }
  };

  // Add debug log for initial form data
  useEffect(() => {
    console.log("=== Form Data Changed ===");
    console.log("Current form data:", formData);
  }, [formData]);

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
              Order Updated Successfully!
            </motion.h2>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Order #{order.id}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                {formData.imageUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={formData.imageUrl}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
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
                          ref={fileInputRef}
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

              {/* Product Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Product Link
                    </label>
                    <input
                      type="url"
                      name="productLink"
                      value={formData.productLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

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
                    />
                  </div>

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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price.toFixed(2)}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Shipping Price
                    </label>
                    <input
                      type="number"
                      name="shippingPrice"
                      value={formData.shippingPrice.toFixed(2)}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PURCHASED">Purchased</option>
                      <option value="RECEIVED_IN_TURKEY">
                        Received in Turkey
                      </option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED_TO_WAREHOUSE">
                        Arrived in Erbil
                      </option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="RETURNED">Returned</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Order Number
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
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
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
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
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                      />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
