"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect, useCallback } from "react";
import {
  X,
  Truck,
  Navigation,
  CheckCircle2,
  WalletCardsIcon,
} from "lucide-react";
import Cookies from "js-cookie";
import { Order } from "@prisma/client";
import { useApp } from "@/providers/AppProvider";
import { motion, AnimatePresence } from "framer-motion";

interface SetPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdated: () => Promise<void>;
}

export default function SetPriceModal({
  isOpen,
  onClose,
  order,
}: SetPriceModalProps) {
  const { setOrderUpdates } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    price: order.price || "",
    shippingPrice: order.shippingPrice || "",
    localShippingPrice: order.localShippingPrice || "",
  });

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch("/api/exchange-rates", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setExchangeRate(data[0].rate);
          }
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    };
    fetchExchangeRate();
  }, []);

  const handleClose = useCallback(() => {
    setSuccess(false);
    setError("");
    setFormData({
      price: order.price || "",
      shippingPrice: order.shippingPrice || "",
      localShippingPrice: order.localShippingPrice || "",
    });
    onClose();
  }, [onClose, order]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value) || 0,
    }));
  };

  const calculateTotal = () => {
    if (!exchangeRate) return "0.00";

    // Convert TRY prices to USD and handle empty strings
    const usdPrice = (Number(formData.price) / exchangeRate) * order.quantity;
    const usdLocalShipping =
      (Number(formData.localShippingPrice) / exchangeRate) * order.quantity;
    // Shipping price is already in USD
    const usdShipping = Number(formData.shippingPrice) * order.quantity;

    const total = usdPrice + usdShipping + usdLocalShipping;

    return total.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      if (!exchangeRate) {
        throw new Error("Exchange rate not available");
      }

      const token = Cookies.get("token");
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: Number(formData.price) / exchangeRate,
          shippingPrice: Number(formData.shippingPrice),
          localShippingPrice: Number(formData.localShippingPrice) / exchangeRate,
          status: "PROCESSING",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }

      await response.json();
      setSuccess(true);

      // Show success animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Close modal
      onClose();

      // Trigger refresh
      setOrderUpdates((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  // Reset form data when order changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        price: order.price || "",
        shippingPrice: order.shippingPrice || "",
        localShippingPrice: order.localShippingPrice || "",
      });
      setSuccess(false);
      setError("");
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      onClose={handleClose}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1.2, 1],
                    rotate: [0, 20, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    times: [0, 0.6, 1],
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-200 dark:bg-green-800/30"
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-green-200 dark:bg-green-800/30"
                  />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-xl font-semibold text-gray-900 dark:text-white text-center"
                >
                  Prices Updated Successfully!
                </motion.h2>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                    Set Order Prices
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Item Price ₺
                        </label>
                        <div className="relative">
                          <WalletCardsIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Shipping Price
                        </label>
                        <div className="relative">
                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            name="shippingPrice"
                            value={formData.shippingPrice}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                            required
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Local Shipping Price
                      </label>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          name="localShippingPrice"
                          value={formData.localShippingPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: 0.4,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Total ({order.quantity} items)
                        </span>
                        <motion.span
                          className="text-lg font-semibold text-gray-900 dark:text-white"
                          key={calculateTotal()}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          ${calculateTotal()}
                        </motion.span>
                      </div>
                    </motion.div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 text-sm text-red-500"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex items-center justify-end gap-4"
                  >
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                          Saving...
                        </span>
                      ) : (
                        "Set Prices"
                      )}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
