"use client";

import { useState } from "react";
import { X, ShoppingCart, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { Order } from "@prisma/client";
import { useApp } from "@/providers/AppProvider";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrders: Order[];
  onOrdersUpdated: () => Promise<void>;
}

export default function BulkUpdateModal({
  isOpen,
  onClose,
  selectedOrders,
  onOrdersUpdated,
}: BulkUpdateModalProps) {
  const { setOrderUpdates } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: "",
    status: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.orderNumber && !formData.status) {
      setError("Please provide either order number or status to update");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");
      const updatePromises = selectedOrders.map((order) =>
        fetch(`/api/orders/${order.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...(formData.orderNumber && { orderNumber: formData.orderNumber }),
            ...(formData.status && { status: formData.status }),
          }),
        })
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some((res) => !res.ok);

      if (hasError) {
        throw new Error("Failed to update some orders");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onOrdersUpdated();
        setOrderUpdates((prev) => prev + 1);
      }, 1500);
    } catch (err) {
      console.error("Error updating orders:", err);
      setError(err instanceof Error ? err.message : "Failed to update orders");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="p-6 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto text-primary"
              >
                <CheckCircle2 className="w-full h-full" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Orders Updated Successfully!
              </motion.h2>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bulk Update Orders ({selectedOrders.length})
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Order Number (Optional)
                    </label>
                    <div className="relative">
                      <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            orderNumber: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                        placeholder="Enter order number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status (Optional)
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                    >
                      <option value="">Select status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PURCHASED">Purchased</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="RETURNED">Returned</option>
                      <option value="RECEIVED_IN_TURKEY">Received in Turkey</option>
                      <option value="DELIVERED_TO_WAREHOUSE">Delivered to Warehouse</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
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
                    disabled={loading || (!formData.orderNumber && !formData.status)}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark active:bg-primary-darker rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                        />
                        Updating...
                      </span>
                    ) : (
                      "Update Orders"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 