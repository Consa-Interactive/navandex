export default function BannerListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="relative aspect-[16/9] animate-pulse bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-2/3 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
