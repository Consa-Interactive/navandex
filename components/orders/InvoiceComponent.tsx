import Image from "next/image";
import { useMemo } from "react";

interface Order {
  id: number;
  title: string;
  size?: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl?: string;
  userId: number;
}

interface InvoiceComponentProps {
  orders: Order[];
  onOrderRemove?: (orderId: number) => void;
}

export default function InvoiceComponent({ orders, onOrderRemove }: InvoiceComponentProps) {
  // Memoize calculations to prevent unnecessary recalculations
  const { subtotal, shipping, total } = useMemo(() => {
    const subtotal = orders.reduce((total, order) => total + (order.price * order.quantity), 0);
    const shipping = 0; // Shipping calculation can be added here
    return {
      subtotal,
      shipping,
      total: subtotal + shipping
    };
  }, [orders]);

  // Error boundary for image loading
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder-image.jpg"; // Make sure to add a placeholder image
    console.error("Failed to load product image");
  };

  if (!Array.isArray(orders)) {
    console.error("Invalid orders data received");
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Invoice Header */}
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice</h2>
            {orders.length > 0 && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Order Count: {orders.length}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No orders scanned yet. Scan an order to get started.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                {order.imageUrl && (
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={order.imageUrl}
                      alt={order.title}
                      fill
                      className="rounded-lg object-cover"
                      onError={handleImageError}
                      sizes="80px"
                      priority={false}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {order.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {order.id} {order.size && `• Size: ${order.size}`}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    ${(order.price * order.quantity).toFixed(2)}
                  </p>
                </div>
                {onOrderRemove && (
                  <button
                    onClick={() => onOrderRemove(order.id)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                    aria-label={`Remove order ${order.id}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {orders.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${shipping.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-base font-medium text-gray-900 dark:text-white">Total</span>
                <span className="text-base font-medium text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 