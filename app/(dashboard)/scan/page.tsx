"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, Search, Printer, WifiOff, X } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import Image from "next/image";

interface ScannedOrder {
  id: number;
  title: string;
  size?: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl?: string;
  userId: number;
  user: {
    name: string;
    phoneNumber: string;
  };
}

interface LoadingStates {
  scanning: boolean;
  processing: boolean;
  printing: boolean;
}

export default function ScanPage() {
  const [barcode, setBarcode] = useState("");
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    scanning: false,
    processing: false,
    printing: false,
  });
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [firstCustomerId, setFirstCustomerId] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [processedBarcodes] = useState(new Set<string>());
  const [orderStats, setOrderStats] = useState({
    receivedInTurkey: 0,
    purchased: 0,
    deliveredToWarehouse: 0
  });

  // Auto-focus management
  useEffect(() => {
    const handleKeyPress = () => {
      const input = document.getElementById("barcodeInput") as HTMLInputElement;
      if (input && document.activeElement !== input) {
        input.focus();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  // Online/Offline state management
  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Internet connection lost. Please check your connection.");
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection restored.");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Prevent accidental page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (scannedOrders.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [scannedOrders]);

  // Fetch order statistics
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        if (!firstCustomerId) {
          setOrderStats({
            receivedInTurkey: 0,
            purchased: 0,
            deliveredToWarehouse: 0
          });
          return;
        }

        const token = Cookies.get("token");
        if (!token) return;

        const response = await fetch(`/api/orders/stats?userId=${firstCustomerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order statistics");
        }

        const stats = await response.json();
        setOrderStats({
          receivedInTurkey: stats.RECEIVED_IN_TURKEY || 0,
          purchased: stats.PURCHASED || 0,
          deliveredToWarehouse: stats.DELIVERED_TO_WAREHOUSE || 0
        });
      } catch (error) {
        console.error("Error fetching order stats:", error);
      }
    };

    fetchOrderStats();
  }, [firstCustomerId]);

  // Validate barcode format
  const validateBarcode = (code: string): boolean => {
    if (!code.trim()) return false;
    if (!/^\d+$/.test(code)) {
      toast.error("Invalid order ID format - only numbers are allowed");
      return false;
    }
    if (code.length > 10) {
      toast.error("Invalid order ID length");
      return false;
    }
    return true;
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || loadingStates.scanning || !isOnline) return;

    // Validate barcode
    if (!validateBarcode(barcode)) {
      setBarcode("");
      return;
    }

    // Check for duplicate scans
    if (processedBarcodes.has(barcode)) {
      toast.error("This barcode was recently processed");
      setBarcode("");
      return;
    }

    setLoadingStates(prev => ({ ...prev, scanning: true }));

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/orders/${barcode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Order not found");
      }

      const order = await response.json();

      // Validate order data
      if (!order || !order.userId) {
        throw new Error("Invalid order data received");
      }

      // Check order status
      if (order.status === "CANCELLED") {
        toast.error("Cannot process cancelled orders");
        return;
      }

      // Check for duplicate orders
      if (scannedOrders.some(o => o.id === order.id)) {
        toast.error("This order has already been scanned");
        return;
      }

      // Process first order
      if (scannedOrders.length === 0) {
        setFirstCustomerId(order.userId);
        setScannedOrders([order]);
        toast.success(`Started new invoice`);
        processedBarcodes.add(barcode);
        setTimeout(() => processedBarcodes.delete(barcode), 5000);
        return;
      }

      // Validate customer match
      if (order.userId !== firstCustomerId) {
        toast.error(`This order belongs to a different customer`);
        return;
      }

      // Add order to list
      setScannedOrders(prev => [...prev, order]);
      toast.success("Order added to list");
      processedBarcodes.add(barcode);
      setTimeout(() => processedBarcodes.delete(barcode), 5000);

    } catch (error) {
      console.error("Error processing barcode:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process barcode");
    } finally {
      setLoadingStates(prev => ({ ...prev, scanning: false }));
      setBarcode("");
      const input = document.getElementById("barcodeInput") as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  };

  const handleOrderRemove = (orderId: number) => {
    if (window.confirm("Are you sure you want to remove this order?")) {
      setScannedOrders(prev => {
        const newOrders = prev.filter(order => order.id !== orderId);
        if (newOrders.length === 0) {
          setFirstCustomerId(null);
          toast.info("Invoice cleared");
        }
        return newOrders;
      });
    }
  };

  const handlePrint = async () => {
    if (loadingStates.printing || scannedOrders.length === 0 || !isOnline) return;

    setLoadingStates((prev) => ({ ...prev, printing: true }));

    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderIds: scannedOrders.map((order) => order.id),
          paymentMethod: "Cash",
          notes: "Generated from scanned orders",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const data = await response.json();
      
      // Open invoice in new tab
      window.open(`/invoices/${data.id}`, "_blank");
      
      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setLoadingStates((prev) => ({ ...prev, printing: false }));
    }
  };

  const handleArrivedErbil = async () => {
    if (scannedOrders.length === 0 || !isOnline) return;

    setLoadingStates((prev) => ({ ...prev, processing: true }));

    try {
      const token = Cookies.get("token");
      const updatePromises = scannedOrders.map((order) =>
        fetch(`/api/orders/${order.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "DELIVERED_TO_WAREHOUSE",
          }),
        })
      );

      await Promise.all(updatePromises);
      
      // Clear scanned orders after successful update
      setScannedOrders([]);
      setFirstCustomerId(null);
      
      toast.success("Orders marked as Arrived in Erbil");
    } catch (error) {
      console.error("Error updating orders:", error);
      toast.error("Failed to update orders");
    } finally {
      setLoadingStates((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleDelivered = async () => {
    if (scannedOrders.length === 0 || !isOnline) return;

    setLoadingStates((prev) => ({ ...prev, processing: true }));

    try {
      const token = Cookies.get("token");
      const updatePromises = scannedOrders.map((order) =>
        fetch(`/api/orders/${order.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "DELIVERED",
          }),
        })
      );

      await Promise.all(updatePromises);
      
      // Clear scanned orders after successful update
      setScannedOrders([]);
      setFirstCustomerId(null);
      
      toast.success("Orders marked as Delivered");
    } catch (error) {
      console.error("Error updating orders:", error);
      toast.error("Failed to update orders");
    } finally {
      setLoadingStates((prev) => ({ ...prev, processing: false }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "RECEIVED_IN_TURKEY":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20";
      case "DELIVERED_TO_WAREHOUSE":
        return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20";
      case "DELIVERED":
        return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "RECEIVED_IN_TURKEY":
        return "Received in Turkey";
      case "DELIVERED_TO_WAREHOUSE":
        return "Arrived Erbil";
      case "DELIVERED":
        return "Delivered";
      default:
        return status.replace(/_/g, " ").toLowerCase();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Üst Panel - Tarama, İstatistikler ve Print */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scan Orders */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 text-center">
              <Package className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Scan Orders
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Scan order barcodes to process them quickly
              </p>
              {!isOnline && (
                <div className="mt-2 flex items-center justify-center gap-2 text-red-500">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Offline - Please check your connection</span>
                </div>
              )}
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="barcodeInput"
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loadingStates.scanning) {
                      e.preventDefault();
                      handleBarcodeSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Scan or enter order ID"
                  disabled={loadingStates.scanning || !isOnline}
                />
                {loadingStates.scanning && (
                  <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>
            </form>

            {/* Action Buttons - Horizontal Layout */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <button
                onClick={handleArrivedErbil}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scannedOrders.length === 0 || !isOnline || loadingStates.processing}
              >
                {loadingStates.processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Arrived in Erbil
              </button>

              <button
                onClick={handleDelivered}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scannedOrders.length === 0 || !isOnline || loadingStates.processing}
              >
                {loadingStates.processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Delivered
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scannedOrders.length === 0 || loadingStates.printing || !isOnline}
              >
                {loadingStates.printing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                {loadingStates.printing ? "Printing..." : "Print Invoice"}
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Panel - İstatistikler */}
        <div>
          
          {/* Order Statistics */}
          <div className="h-full rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col h-[calc(100%-2rem)]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Statistics</h3>
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Received in Turkey</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{orderStats.receivedInTurkey}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchased</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{orderStats.purchased}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-200h dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered to Warehouse</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{orderStats.deliveredToWarehouse}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice - Full Width */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>

                {firstCustomerId && scannedOrders.length > 0 && (
                 <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-white">
                        {scannedOrders[0].user.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {scannedOrders[0].user.phoneNumber}
                      </p>
                </div>
              )}


              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Order Count: {scannedOrders.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {scannedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                No orders scanned yet. Scan an order to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500 dark:border-gray-700">
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0">ID</th>
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0">Title</th>
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0">Status</th>
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0">Quantity</th>
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0 text-right">Total</th>
                      <th className="whitespace-nowrap px-2 py-3 first:pl-0 last:pr-0"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {scannedOrders.map((order) => (
                      <tr key={order.id} className="text-sm text-gray-600 dark:text-gray-400">
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0">
                          #{order.id}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0">
                          <div className="flex items-center gap-3">
                            {order.imageUrl && (
                              <div className="relative h-10 w-10 flex-shrink-0">
                                <Image
                                  src={order.imageUrl}
                                  alt={order.title}
                                  fill
                                  className="rounded-lg object-cover"
                                  sizes="40px"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.title}
                              </p>
                              {order.size && (
                                <p className="text-xs text-gray-500">Size: {order.size}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0">
                          <div className="flex justify-start">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClass(order.status)}`}>
                              {formatStatus(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0">
                          {order.quantity}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0 text-right font-medium text-gray-900 dark:text-white">
                          ${(order.price * order.quantity).toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 first:pl-0 last:pr-0 text-right">
                          <button
                            onClick={() => handleOrderRemove(order.id)}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${scannedOrders.reduce((total, order) => total + (order.price * order.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-base font-medium text-gray-900 dark:text-white">Total</span>
                  <span className="text-base font-medium text-primary">
                    ${scannedOrders.reduce((total, order) => total + (order.price * order.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 