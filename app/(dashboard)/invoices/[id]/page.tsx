"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useParams } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";
import Image from "next/image";
import Cookies from "js-cookie";
import { QRCodeSVG } from 'qrcode.react';

interface Order {
  id: string;
  title: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
  imageUrl: string | null;
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

export default function InvoiceDetailsPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/invoices/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch invoice");
        }

        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load invoice"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  // Add global print styles when component mounts
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          margin: 0;
          size: auto;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Hide browser elements */
        #__next-build-watcher,
        #__next-route-announcer,
        .next-debug,
        .print-hide,
        nav,
        header,
        .sidebar,
        .mobile-menu,
        button[aria-label="Toggle Menu"],
        [role="navigation"] {
          display: none !important;
        }
        /* Hide URL */
        @page {
          margin: 0;
        }
        @page :first {
          margin-top: 0;
        }
        /* Reset background colors for print */
        * {
          background-color: transparent !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      window.print();
    } finally {
      setIsPrinting(false);
    }
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
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Print Button - Hidden in Print */}
        <div className="print:hidden text-right mb-4">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Print Invoice
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white shadow-sm print:shadow-none">
          {/* Invoice Header */}
          <div className="p-4 sm:p-8 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-4">
              {/* Company Logo & Info */}
              <div className="flex items-start gap-4">
                <div className="relative h-12 w-12 sm:h-16 sm:w-16">
                  <Image
                    src="/logo.png"
                    alt="Navand Express"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="font-bold">
                    {process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Navand Express"}
                  </h2>
                  <div className="text-sm space-y-0.5 font-semibold">
                    {JSON.parse(process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "[]").map((phone: string, index: number) => (
                      <p key={index}>{phone}</p>
                    ))}
                    <p>{process.env.NEXT_PUBLIC_COMPANY_CITY ?? ""}</p>
                    <p>{process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? ""}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="text-right space-y-1">
                <div className="flex items-start justify-end gap-4">
                  
                  <div>
                    <h2 className="font-bold text-sm sm:text-base">
                      {invoice.user.name}
                    </h2>
                    <p className="text-red-500 font-medium text-xs sm:text-sm">
                      {invoice.user.phoneNumber}
                    </p>
                    <p className="text-xs sm:text-sm">{invoice.user.address}</p>
                    <p className="text-xs sm:text-sm">
                      {new Date(invoice.date).toISOString().split("T")[0].replace(/-/g, ".")}
                    </p>
                  </div>

                  <div >
                    <QRCodeSVG
                      value={`${process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://localhost:3000/"}`}
                      size={100}
                      level="L"
                      imageSettings={{
                        src: '/logo.png',
                        height: 15,
                        width: 15,
                        excavate: true,
                      }}
                      includeMargin={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="p-4 sm:p-8">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b text-xs sm:text-sm">
                    <th className="pb-3 text-left font-medium">ID</th>
                    <th className="pb-3 text-left font-medium">Title</th>
                    <th className="pb-3 text-center font-medium">Status</th>
                    <th className="pb-3 text-center font-medium">Quantity</th>
                    <th className="pb-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">
                  {invoice.orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-b-0">
                      <td className="py-3 sm:py-4">{order.id}</td>
                      <td className="py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {order.imageUrl && (
                            <div className="relative h-8 w-8 sm:h-12 sm:w-12 border rounded">
                              <Image
                                src={order.imageUrl}
                                alt={order.title || ""}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <span className="text-xs sm:text-sm line-clamp-2">
                            {order.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 text-center print:hidden">
                        <span className="inline-flex px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 text-center">
                        {order.quantity}
                      </td>
                      <td className="py-3 sm:py-4 text-right">
                        $
                        {(
                          order.price * order.quantity +
                          (order.shippingPrice + order.localShippingPrice) *
                            order.quantity
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 sm:mt-6 flex justify-end">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-red-500 font-bold">
                  Total: ${invoice.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
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
