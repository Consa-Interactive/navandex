"use client";

import { X } from "lucide-react";
import { OrderType } from "@/providers/AppProvider";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { printLabel } from "@/utils/printLabel";
import { toast } from "sonner";

declare global {
  interface Window {
    JsBarcode: (element: SVGElement, data: string, options?: object) => void;
  }
}

interface LabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderType;
  onOrderUpdated: () => Promise<void>;
}

interface User {
  id: number;
  name: string;
  phoneNumber: string;
}

export default function LabelModal({ isOpen, onClose, order, onOrderUpdated }: LabelModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const orderNumber = `TR${order.id.toString().padStart(5, '0')}`;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`/api/orders/${order.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();
        if (orderData && orderData.user) {
          setUser(orderData.user);
        } else {
          throw new Error("No user data in order");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && order.id) {
      fetchUser();
    }
  }, [isOpen, order.id]);

  useEffect(() => {
    // Generate barcode in modal when user data is loaded
    if (!loading && user && barcodeRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
      script.onload = () => {
        if (window.JsBarcode && barcodeRef.current) {
          window.JsBarcode(barcodeRef.current, orderNumber, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 14,
            margin: 0,
            background: "#ffffff"
          });
        }
      };
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [loading, user, orderNumber]);

  if (!isOpen) return null;

  const handlePrint = () => {
    printLabel({
      orderNumber,
      userName: user?.name || '',
      userPhone: user?.phoneNumber || ''
    });

    onClose();
  };

  const handleReceivedInTurkey = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "RECEIVED_IN_TURKEY",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      await onOrderUpdated();
      toast.success("Order marked as Received in Turkey");
      onClose();
    } catch (error) {
      console.error("Error updating order status:", error);
      setError(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Label</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400">
              <p>Error loading user information</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : user ? (
            <div className="text-center space-y-4">
              <div className="w-full flex justify-center">
                <svg ref={barcodeRef} className="w-full max-h-[50px]"></svg>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {user.phoneNumber}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No user information available</p>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleReceivedInTurkey}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
          >
            {loading ? "Updating..." : "Received in Turkey"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark active:bg-primary-darker rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
          >
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
} 