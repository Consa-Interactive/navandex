"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { DollarSign, Plus } from "lucide-react";

interface ExchangeRate {
  id: number;
  rate: number;
  createdAt: string;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/exchange-rates", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rates");
      }

      const data = await response.json();
      setRates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Failed to load exchange rates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rate: parseFloat(newRate) }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rate");
      }

      toast.success("Exchange rate added successfully");
      setNewRate("");
      fetchRates();
    } catch (error) {
      console.error("Error creating rate:", error);
      toast.error("Failed to add exchange rate");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Exchange Rates
        </h1>
      </div>

      {/* Add New Rate Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              New Exchange Rate (TRY/USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Enter rate (e.g., 35.00)"
                className="block w-full rounded-xl border border-gray-200 bg-white px-11 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-orange-600/90"
          >
            <Plus className="h-5 w-5" />
            Add Rate
          </button>
        </form>
      </div>

      {/* Rates History */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="font-medium text-gray-900 dark:text-white">
            Exchange Rate History
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {rate.rate.toFixed(2)} TRY/USD
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(rate.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
