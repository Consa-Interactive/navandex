"use client";

import { Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg text-center">
        {/* 404 Illustration */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-primary">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you are looking for might have been removed or is
          temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-primary text-white hover:bg-orange-500/50 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Need assistance? Contact our support team at</p>
          <a
            href="mailto:support@consainteractive.com"
            className="text-primary hover:text-primary/80 font-medium"
          >
            support@consainteractive.com
          </a>
        </div>
      </div>
    </div>
  );
}
