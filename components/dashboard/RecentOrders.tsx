"use client";

import { Clock, ChevronRight, Package, DollarSign } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/providers/AppProvider";
import { Order } from "@prisma/client";
import Image from "next/image";

export default function RecentOrders() {
  const { orders } = useApp();

  const recentOrders = orders?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PROCESSING":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "CONFIRMED":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "SHIPPED":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "DELIVERED":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const calculateTotal = (order: Order) => {
    return (
      order.price * order.quantity +
      order.shippingPrice * order.quantity +
      order.localShippingPrice * order.quantity
    ).toFixed(2);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
        </div>
        <Link
          href="/orders"
          className="flex items-center gap-1 text-sm text-primary hover:text-orange-600/90"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {recentOrders.map((order: Order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-primary dark:border-gray-700 dark:bg-gray-700/50"
          >
            {/* Order Image */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {order.imageUrl ? (
                <Image
                  src={order.imageUrl}
                  alt={order.title || ""}
                  className="h-full w-full object-cover"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Order #{order.id}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {order.title}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Package className="h-4 w-4" />
                    <span>Qty: {order.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                    <DollarSign className="h-4 w-4" />
                    <span>${calculateTotal(order)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}

        {recentOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-12 dark:bg-gray-700/50">
            <Package className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No orders yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
