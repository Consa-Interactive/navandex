"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  ShoppingCart,
  AlertTriangle,
  Truck,
} from "lucide-react";
import Cookies from "js-cookie";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  deliveredOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  monthlySpending: {
    month: string;
    amount: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  recentActivity: {
    id: number;
    action: string;
    date: string;
    details: string;
  }[];
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  title: string | null;
}

export default function StatsPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const response = await fetch("/api/user/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();

        // Calculate total spent from all orders
        const totalSpent = data.allOrders.reduce(
          (sum: number, order: Order) => sum + (order.total || 0),
          0
        );

        // Calculate average order value
        const averageOrderValue =
          data.allOrders.length > 0 ? totalSpent / data.allOrders.length : 0;

        // Process the data to match our stats interface
        const processedStats: OrderStats = {
          totalOrders: data.allOrders.length,
          totalSpent: totalSpent,
          averageOrderValue: averageOrderValue,
          deliveredOrders: data.allOrders.filter(
            (order: Order) => order.status === "DELIVERED"
          ).length,
          processingOrders: data.allOrders.filter(
            (order: Order) => order.status === "PROCESSING"
          ).length,
          cancelledOrders: data.allOrders.filter(
            (order: Order) => order.status === "CANCELLED"
          ).length,
          monthlySpending: processMonthlySpending(data.allOrders),
          ordersByStatus: [
            {
              status: "DELIVERED",
              count: data.allOrders.filter(
                (order: Order) => order.status === "DELIVERED"
              ).length,
            },
            {
              status: "PROCESSING",
              count: data.allOrders.filter(
                (order: Order) => order.status === "PROCESSING"
              ).length,
            },
            {
              status: "CANCELLED",
              count: data.allOrders.filter(
                (order: Order) => order.status === "CANCELLED"
              ).length,
            },
          ],
          recentActivity: data.recentOrders.map((order: Order) => ({
            id: order.id,
            action: order.status,
            date: order.createdAt,
            details: `Order #${order.id} - ${order.title || "No title"} ($${(
              order.total || 0
            ).toFixed(2)})`,
          })),
        };

        setStats(processedStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper function to process monthly spending
  const processMonthlySpending = (orders: Order[]) => {
    const months: { [key: string]: number } = {};

    orders.forEach((order) => {
      if (!order.createdAt || !order.total) return;

      const date = new Date(order.createdAt);
      const monthKey = date.toLocaleString("default", { month: "short" });
      months[monthKey] = (months[monthKey] || 0) + order.total;
    });

    // Convert to array and sort by month
    return Object.entries(months)
      .map(([month, total]) => ({
        month,
        amount: total,
      }))
      .sort((a, b) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PROCESSING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "PURCHASED":
        return <ShoppingCart className="w-5 h-5 text-pink-500" />;
      case "PENDING":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-500 bg-green-500/10";
      case "PROCESSING":
        return "text-yellow-500 bg-yellow-500/10";
      case "CANCELLED":
        return "text-red-500 bg-red-500/10";
      case "PURCHASED":
        return "text-pink-500 bg-pink-500/10";
      case "PENDING":
        return "text-orange-500 bg-orange-500/10";
      case "SHIPPED":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section Skeleton */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Monthly Spending Chart Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>

            {/* Orders by Status Chart Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
              </div>
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return <div>Loading...</div>;
  }

  const maxAmount = Math.max(...stats.monthlySpending.map((d) => d.amount));

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6 lg:mt-0 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Order Statistics
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Track your order history and spending patterns
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-medium">8%</span>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Average Order
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-sm font-medium">3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Status Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Order Status Distribution
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Delivered */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Delivered
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.deliveredOrders}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (stats.deliveredOrders / stats.totalOrders) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Processing */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Processing
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.processingOrders}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (stats.processingOrders / stats.totalOrders) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Cancelled
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.cancelledOrders}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (stats.cancelledOrders / stats.totalOrders) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(
                      activity.action
                    )}`}
                  >
                    {getStatusIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      getStatusColor(activity.action).split(" ")[0]
                    }`}
                  >
                    {activity.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Spending Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Spending
          </h2>
          {stats.monthlySpending.length > 0 ? (
            <div className="h-[300px] flex items-end gap-4">
              {stats.monthlySpending.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full bg-primary/10 dark:bg-primary/5 rounded-t-lg hover:bg-primary/20 dark:hover:bg-primary/10 transition-colors duration-200 relative group">
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-110"
                      style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No spending data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
