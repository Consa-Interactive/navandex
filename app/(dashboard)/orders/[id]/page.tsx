"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Eye,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Box,
  XCircle,
  CheckCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Order {
  id: number;
  title: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
  status: string;
  productLink: string;
  imageUrl: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    phoneNumber: string;
  };
  statusHistory: {
    status: string;
    createdAt: string;
    user: {
      name: string;
    };
  }[];
  prepaid: boolean;
}

const statusColors = {
  PENDING: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-500",
    dot: "bg-yellow-500",
    ring: "ring-yellow-500",
    icon: Clock,
  },
  PROCESSING: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
    ring: "ring-blue-500",
    icon: ShoppingCart,
  },
  PURCHASED: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-700 dark:text-pink-500",
    dot: "bg-pink-500",
    ring: "ring-pink-500",
    icon: CheckCircle2,
  },
  SHIPPED: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
    ring: "ring-purple-500",
    icon: Package,
  },
  DELIVERED: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
    ring: "ring-green-500",
    icon: CheckCheck,
  },
  CANCELLED: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-500",
    dot: "bg-red-500",
    ring: "ring-red-500",
    icon: XCircle,
  },
  CONFIRMED: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-500",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500",
    icon: CheckCheck,
  },
  RECEIVED_IN_TURKEY: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-500",
    dot: "bg-indigo-500",
    ring: "ring-indigo-500",
    icon: Package,
  },
  DELIVERED_TO_WAREHOUSE: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
    ring: "ring-purple-500",
    icon: Box,
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created At: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-900 dark:text-white">
                  Product Image
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-medium ${
                      order.prepaid
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-500"
                    }`}
                  >
                    {order.prepaid ? "Prepaid" : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-6">
              <div className="relative w-full max-w-[400px] aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                {order.imageUrl ? (
                  <Image
                    src={order.imageUrl}
                    alt={order.title}
                    width={400}
                    height={300}
                    className="object-contain w-full h-full"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Product Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {order.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {order.size && (
                        <span className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          Size: {order.size}
                        </span>
                      )}
                      {order.color && (
                        <span className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                          Color: {order.color}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        Quantity: {order.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <p className="inline-flex items-center rounded-xl bg-orange-400 px-4 py-2 text-base font-medium text-white">
                      $
                      {(
                        (order.price +
                          order.localShippingPrice +
                          order.shippingPrice) *
                        order.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={order.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                    View Product
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                <h2 className="font-medium text-gray-900 dark:text-white">
                  Order Notes
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Info & Timeline */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-8 pr-4">
                  {order.statusHistory?.map((history, index) => {
                    const StatusIcon =
                      statusColors[history.status as keyof typeof statusColors]
                        ?.icon || Package;
                    return (
                      <div key={index} className="relative flex gap-4">
                        <div
                          className={`absolute -left-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            statusColors[
                              history.status as keyof typeof statusColors
                            ]?.bg || "bg-gray-100"
                          } ring-4 ring-white dark:ring-gray-800`}
                        >
                          <StatusIcon
                            className={`h-5 w-5 ${
                              statusColors[
                                history.status as keyof typeof statusColors
                              ]?.text || "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 pt-1.5 pl-12">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {history.status}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(history.createdAt).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>by {history.user.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Customer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                    {order.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {order.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.user.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
