"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import Cookies from "js-cookie";
import { Order } from "@prisma/client";

interface OrderActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => Promise<void>;
}

export default function OrderActionModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: OrderActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "CONFIRMED" | "CANCELLED") => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }

      const updatedOrder = await response.json();
      await onOrderUpdated(updatedOrder);
      onClose();
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      onClose={onClose}
      open={isOpen}
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Confirm Order #{order.id}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Order Details
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Title: {order.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quantity: {order.quantity}
                </p>

                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Total: $
                  {(
                    order.price * order.quantity +
                    order.shippingPrice * order.quantity +
                    order.localShippingPrice * order.quantity
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => handleAction("CANCELLED")}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
              >
                <XCircle className="h-4 w-4" />
                Reject Order
              </button>
              <button
                type="button"
                onClick={() => handleAction("CONFIRMED")}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-500 dark:hover:bg-green-500/20"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm Order
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
