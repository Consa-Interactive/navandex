"use client";

import {
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { Order } from "@prisma/client";

export default function Stats() {
  const { orders } = useApp();

  const stats = {
    totalOrders: orders?.length || 0,
    totalSpent:
      orders?.reduce(
        (acc: number, order: Order) =>
          acc +
          (order.price || 0) * (order.quantity || 1) +
          (order.shippingPrice || 0) * (order.quantity || 1) +
          (order.localShippingPrice || 0) * (order.quantity || 1),
        0
      ) || 0,
    processingOrders:
      orders?.filter((order: Order) => order.status === "PROCESSING").length ||
      0,
    deliveredOrders:
      orders?.filter((order: Order) => order.status === "DELIVERED").length ||
      0,
    pendingOrders:
      orders?.filter((order: Order) => order.status === "PENDING").length || 0,
    shippedOrders:
      orders?.filter((order: Order) => order.status === "SHIPPED").length || 0,
    confirmedOrders:
      orders?.filter((order: Order) => order.status === "CONFIRMED").length ||
      0,
    cancelledOrders:
      orders?.filter((order: Order) => order.status === "CANCELLED").length ||
      0,
  };

  const getGrowthRate = () => {
    if (!orders?.length) return 0;
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    const thisMonthOrders = orders.filter(
      (order) => new Date(order.createdAt) >= lastMonth
    );
    return ((thisMonthOrders.length / orders.length) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                {getGrowthRate()}% growth
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${stats.totalSpent.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Including shipping
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Processing
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.processingOrders}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Active orders
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Delivered
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.deliveredOrders}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Completed orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Status Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <ShoppingCart className="h-5 w-5 text-gray-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.pendingOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.processingOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Processing
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.confirmedOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Confirmed
            </p>
          </div>

          <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
            <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.shippedOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shipped</p>
          </div>

          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
            <Package className="h-5 w-5 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.deliveredOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Delivered
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <Users className="h-5 w-5 text-red-600 dark:text-red-400 mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.cancelledOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cancelled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
