"use client";

export default function BannerSkeleton() {
  return (
    <div className="relative aspect-[5/1] w-full animate-pulse overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <div className="h-8 w-1/3 rounded-lg bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-1/2 rounded-lg bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
