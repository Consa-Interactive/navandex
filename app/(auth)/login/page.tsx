"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/providers/AppProvider";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  // Cleanup function
  useEffect(() => {
    return () => {
      setLoading(false);
      setFormData({ phoneNumber: "", password: "" });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache"
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: "+964" + formData.phoneNumber.replace(/^0+/, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Login and show success message
      await login(data.access_token);
      toast.success("Login successful!");

      // Use router.replace with cache busting
      router.replace("/?ts=" + new Date().getTime());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="flex justify-center">
            <Image 
              src="/logo_dark.png" 
              alt="NavandExpress" 
              width={125} 
              height={125}
              priority
            />
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                +964
              </span>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .replace(/^0+/, "");
                  setFormData({ ...formData, phoneNumber: value });
                }}
                className={inputClassName + " pl-16"}
                placeholder="750 XXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={inputClassName}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-dark active:bg-primary-darker rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
