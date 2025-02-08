export const ACTIVE_ORDER_STATUSES = [
  "CONFIRMED",
  "PURCHASED",
  "RECEIVED_IN_TURKEY",
  "DELIVERED_TO_WAREHOUSE",
] as const;

export const PASSIVE_ORDER_STATUSES = [
  "DELIVERED",
  "DELIVERED_TO_WAREHOUSE",
  "CANCELLED",
  "RETURNED",
] as const;

export const STATUS_FILTERS = [
  { value: "ALL", label: "All Orders", color: "gray" },
  { value: "ACTIVE", label: "Active", color: "emerald" },
  { value: "PASSIVE", label: "Passive", color: "gray" },
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "PROCESSING", label: "Processing", color: "blue" },
  { value: "CONFIRMED", label: "Confirmed", color: "emerald" },
  { value: "PURCHASED", label: "Purchased", color: "pink" },
  { value: "SHIPPED", label: "Shipped", color: "purple" },
  { value: "DELIVERED", label: "Delivered", color: "green" },
  { value: "CANCELLED", label: "Cancelled", color: "red" },
  { value: "RETURNED", label: "Returned", color: "orange" },
  { value: "RECEIVED_IN_TURKEY", label: "Received in Turkey", color: "indigo" },
  { value: "DELIVERED_TO_WAREHOUSE", label: "Delivered to Warehouse", color: "purple" },
] as const; 