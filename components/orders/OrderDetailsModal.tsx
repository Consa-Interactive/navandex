"use client";

import {
  DialogTitle,
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { X, Package, Phone, DollarSign } from "lucide-react";
import Image from "next/image";

export interface OrderDetails {
  id: number;
  title: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
  status: string;
  prepaid: boolean;
  productLink?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    phoneNumber: string;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Order #{order.id}
                    </DialogTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt.toString())}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`rounded-xl ${
                      order.status === "CANCELLED"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : order.status === "DELIVERED"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : order.status === "PURCHASED"
                        ? "bg-pink-50 dark:bg-pink-900/20"
                        : order.status === "PROCESSING"
                        ? "bg-yellow-50 dark:bg-yellow-900/20"
                        : order.status === "SHIPPED"
                        ? "bg-purple-50 dark:bg-purple-900/20"
                        : "bg-blue-50 dark:bg-blue-900/20"
                    } p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            order.status === "CANCELLED"
                              ? "text-red-700 dark:text-red-500"
                              : order.status === "DELIVERED"
                              ? "text-green-700 dark:text-green-500"
                              : order.status === "PURCHASED"
                              ? "text-pink-700 dark:text-pink-500"
                              : order.status === "PROCESSING"
                              ? "text-yellow-700 dark:text-yellow-500"
                              : order.status === "SHIPPED"
                              ? "text-purple-700 dark:text-purple-500"
                              : "text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          Order Status
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {order.status}
                        </p>
                      </div>
                      <Package
                        className={`h-8 w-8 ${
                          order.status === "CANCELLED"
                            ? "text-red-500"
                            : order.status === "DELIVERED"
                            ? "text-green-500"
                            : order.status === "PURCHASED"
                            ? "text-pink-500"
                            : order.status === "PROCESSING"
                            ? "text-yellow-500"
                            : order.status === "SHIPPED"
                            ? "text-purple-500"
                            : "text-blue-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Prepaid Status */}
                  {order.prepaid && (
                    <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-500">
                            Payment Status
                          </p>
                          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            Prepaid
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-indigo-500" />
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
                        <span className="absolute inset-0 flex items-center justify-center text-base font-medium text-white">
                          {order.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {order.user.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4" />
                          {order.user.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Product Details
                    </h3>
                    <div className="mt-4 flex items-start gap-4">
                      {order.imageUrl ? (
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                          <Image
                            src={order.imageUrl}
                            alt={order.title}
                            className="h-full w-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                      ) : (
                        <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700">
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {order.title}
                        </h4>
                        {order.productLink && (
                          <a
                            href={order.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-primary hover:underline"
                          >
                            View Product Link
                          </a>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {order.size && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              Size: {order.size}
                            </span>
                          )}
                          {order.color && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              Color: {order.color}
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Qty: {order.quantity}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Unit Price
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${order.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Subtotal ({order.quantity} items)
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(order.price * order.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Shipping Price */}
                      {/* <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(order.shippingPrice * order.quantity).toFixed(2)}
                        </span>
                      </div> */}

                      {/* Local Shipping */}
                      {/* <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Local Shipping</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          $
                          {(order.localShippingPrice * order.quantity).toFixed(
                            2
                          )}
                        </span>
                      </div> */}
                      <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-gray-900 dark:text-white">
                            Total
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-white">
                            $
                            {(
                              order.price * order.quantity +
                              order.shippingPrice * order.quantity +
                              order.localShippingPrice * order.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && order.notes !== "N/A" && (
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Notes
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
