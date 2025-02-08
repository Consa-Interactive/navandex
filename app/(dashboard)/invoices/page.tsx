"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import {
  FileText,
  Printer,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";

interface Order {
  id: string;
  title: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
}

interface User {
  id: string;
  name: string;
  email?: string;
  address: string | null;
  phoneNumber: string | null;
}

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  user: User;
  orders: Order[];
  total: number;
  notes: string | null;
  paymentMethod: string;
}

export default function InvoicePage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/invoices", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")!}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch invoice");
        }
        const data = await response.json();
        // For now, we'll just use the first invoice
        if (data && data.length > 0) {
          setInvoice(data[0]);
        } else {
          setError("No invoices found");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, []);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    const colors = {
      PAID: {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      },
      PENDING: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
      },
      OVERDUE: {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle className="h-5 w-5 text-red-500" />,
      },
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{error || "No invoice found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Hidden in Print */}
        <div className="print:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Invoice Details
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage and view invoice information
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {isPrinting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                Print
              </button>

              <button
                onClick={() => setShowShareDialog(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </motion.div>
        </div>

        {/* Invoice Card - Only this will be printed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800 print:shadow-none print:m-0 print:p-0 print:rounded-none print:bg-white"
          style={{ pageBreakAfter: "always" }}
        >
          {/* Invoice Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50 print:bg-white print:border-gray-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white print:text-black">
                  Invoice #{invoice.id}
                </h2>
                <div className="mt-1 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  <p>
                    Issue Date: {new Date(invoice.date).toLocaleDateString()}
                  </p>
                  <p>
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Image src="/logo.png" alt="" width={100} height={100} />
                <div
                  className={`print:hidden flex items-center gap-2 rounded-full px-4 py-2 ${
                    getStatusColor(invoice.status).bg
                  } print:bg-transparent`}
                >
                  <span className="print:hidden">
                    {getStatusColor(invoice.status).icon}
                  </span>
                  <span className="text-sm font-medium print:text-gray-600">
                    {invoice.status.charAt(0) +
                      invoice.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 print:p-4">
            {/* Customer and Company Info */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 print:gap-4">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 print:bg-transparent print:border print:border-gray-200">
                <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white print:text-black">
                  Bill To:
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white print:text-black">
                    {invoice.user.name}
                  </p>
                  <p>{invoice.user.email}</p>
                  <p>{invoice.user.phoneNumber}</p>
                  <p>{invoice.user.address}</p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 print:bg-transparent print:border print:border-gray-200">
                <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white print:text-black">
                  Payment Details:
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  <p>Payment Method: {invoice.paymentMethod}</p>
                  <p>
                    Status:{" "}
                    {invoice.status.charAt(0) +
                      invoice.status.slice(1).toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-300">
                <thead className="print:bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Item
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Size
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Color
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 print:divide-gray-200">
                  {invoice.orders.map((order) => (
                    <tr key={order.id} className="print:hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white print:text-gray-900">
                            {order.title}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
                        {order.size}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">
                        {order.color}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-900 dark:text-white print:text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-900 dark:text-white print:text-gray-900">
                        ${order.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-gray-900 dark:text-white print:text-gray-900">
                        $
                        {(
                          order.price * order.quantity +
                          order.shippingPrice * order.quantity +
                          order.localShippingPrice * order.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-md rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50 print:bg-transparent print:border print:border-gray-200">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900 dark:text-white print:text-gray-900">
                    Total
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-white print:text-gray-900">
                    ${invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 print:bg-transparent print:border print:border-gray-200">
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white print:text-gray-900">
                  Notes:
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Dialog - Hidden in Print */}
      <div className="print:hidden">
        <Dialog
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Share Invoice
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose how you would like to share this invoice:
                </p>
                <div className="mt-4 space-y-3">
                  <button className="w-full rounded-lg border border-gray-200 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                    Share via Email
                  </button>
                  <button className="w-full rounded-lg border border-gray-200 p-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">
                    Copy Invoice Link
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
