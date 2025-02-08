"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, Truck, XCircle } from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for rejection reasons
const MOCK_REJECTION_DATA = [
  { reason: "Out of Stock", count: 15 },
  { reason: "Price Changed", count: 8 },
  { reason: "Shipping Issues", count: 12 },
  { reason: "Customer Request", count: 5 },
  { reason: "Quality Issues", count: 3 },
];

const COLORS = ["#F97316", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"];

interface ReportData {
  orders: {
    totalOrders: number;
    byStatus: Record<string, number>;
    trends: Array<{
      month: string;
      total: number;
      cancelled: number;
      completed: number;
      processing: number;
    }>;
  };
  financial: {
    totalRevenue: number;
    shippingCosts: {
      shippingPrice: number;
      localShippingPrice: number;
    };
  };
}

const ORDER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PURCHASED", label: "Purchased" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RECEIVED_IN_TURKEY", label: "Received in Turkey" },
  { value: "DELIVERED_TO_WAREHOUSE", label: "Delivered to Warehouse" },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden rounded-xl ${gradient} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl`}
  >
    <div className="relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
    <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
  </motion.div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const statusParam = selectedStatus ? `&status=${selectedStatus}` : "";
        const response = await fetch(
          `/api/reports?startDate=${dateRange.start}&endDate=${dateRange.end}${statusParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
      setLoading(false);
    };

    fetchReports();
  }, [dateRange, selectedStatus]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header with Date Range Selection */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          Reports
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              End:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Orders"
          value={reportData?.orders?.totalOrders || 0}
          icon={Package}
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
        />

        <StatCard
          title="Total Revenue"
          value={`$${reportData?.financial?.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />

        <StatCard
          title="Shipping Cost"
          value={`$${
            reportData?.financial?.shippingCosts?.shippingPrice?.toFixed(2) ||
            "0.00"
          }`}
          icon={Truck}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />

        <StatCard
          title="Local Shipping"
          value={`$${
            reportData?.financial?.shippingCosts?.localShippingPrice?.toFixed(
              2
            ) || "0.00"
          }`}
          icon={Package}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
      </div>

      {/* Status Distribution */}
      {reportData?.orders?.byStatus && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Order Status Distribution
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(reportData.orders.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {ORDER_STATUSES.find((s) => s.value === status)?.label || status}
                </div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Trends Chart */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Order Trends
        </h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportData?.orders?.trends || []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
                tickFormatter={(value) => Math.round(value).toString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: '#374151', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="total"
                name="Total Orders"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="processing"
                name="Processing"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="cancelled"
                name="Cancelled"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rejection Reasons Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rejection Reasons Chart */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Rejection Reasons
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_REJECTION_DATA}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {MOCK_REJECTION_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rejection Details Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Rejections
            </h2>
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-500">
              <XCircle className="mr-1.5 h-4 w-4" />
              {MOCK_REJECTION_DATA.reduce((acc, curr) => acc + curr.count, 0)} Total
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {MOCK_REJECTION_DATA.map((item, index) => (
                  <tr key={item.reason}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.reason}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{item.count}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {(
                        (item.count /
                          MOCK_REJECTION_DATA.reduce(
                            (acc, curr) => acc + curr.count,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-64 items-center justify-center"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-lg" />
        </motion.div>
      )}
    </div>
  );
}
