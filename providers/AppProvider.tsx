"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@prisma/client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Order } from "@prisma/client";
export type OrderType = Order;

interface AppContextType {
  user: User | null;
  orders: OrderType[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  orderUpdates: number;
  setOrders: (orders: OrderType[]) => void;
  updateOrder: (updatedOrder: OrderType) => void;
  triggerOrderUpdate: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  setOrderUpdates: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(0);
  const router = useRouter();

  const triggerOrderUpdate = useCallback(() => {
    return Promise.resolve(setOrderUpdates((prev) => prev + 1));
  }, []);

  const updateOrder = useCallback((updatedOrder: OrderType) => {
    setOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex((o) => o.id === updatedOrder.id);
      if (orderIndex === -1) {
        return [...prevOrders, updatedOrder];
      }
      const newOrders = [...prevOrders];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      Cookies.remove("token");
      setUser(null);
      throw error;
    }
  };

  const fetchOrders = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    refreshUser();
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setOrders([]);
    router.push("/login");
  };

  const refreshUser = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await fetchUser(token);
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (user) {
      await fetchOrders();
    }
  };

  // Fetch orders when user changes or orderUpdates is triggered
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, orderUpdates]);

  // Initial auth check
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    orders,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    orderUpdates,
    setOrders,
    updateOrder,
    triggerOrderUpdate,
    refreshOrders,
    setOrderUpdates,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
