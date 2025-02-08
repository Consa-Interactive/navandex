"use client";

import { useState } from "react";
import { Eye, EyeOff, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const KURDISTAN_CITIES = [
  { value: "ER", label: "Erbil" },
  { value: "SU", label: "Sulaymaniyah" },
  { value: "DU", label: "Duhok" },
  { value: "AK", label: "Akre" },
  { value: "ZA", label: "Zakho" },
  { value: "BA", label: "Baghdad" },
  { value: "MO", label: "Mousul" },
  { value: "KA", label: "Kirkuk" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
    address: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: "+964" + formData.phoneNumber.replace(/^0+/, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200";

  return (
    <div id="register" className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Registration Successful!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 dark:text-gray-400"
            >
              Redirecting to login...
            </motion.p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <span className="flex justify-center mb-4">
                <Image src="/logo.png" alt="asd" width={125} height={125} />
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Join us and start shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-0">
                <div className="space-y-0">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={inputClassName}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-0">
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
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                  <MapPin className="w-4 h-4" />
                  Address Information
                </h3>

                <div className="space-y-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className={inputClassName}
                    >
                      <option value="">Select a city</option>
                      {KURDISTAN_CITIES.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-0">
                    <label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Address Details
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter your detailed address"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-0 ">
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
                    placeholder="Create a strong password"
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

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-dark active:bg-primary-darker rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
