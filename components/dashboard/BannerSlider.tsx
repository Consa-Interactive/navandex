"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link?: string | null;
  isActive: boolean;
  order: number;
}

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative aspect-[5/1] w-full overflow-hidden rounded-2xl">
      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentBannerIndex(
                (prev) => (prev - 1 + banners.length) % banners.length
              )
            }
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
            }
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </>
      )}

      {/* Banner Content */}
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transform: `translateX(-${currentBannerIndex * 100}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="absolute left-0 top-0 h-full w-full"
            style={{ transform: `translateX(${index * 100}%)` }}
          >
            <Link href={banner.link || "#"} className="block h-full w-full">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl font-bold text-white">
                  {banner.title}
                </h2>
                <p className="mt-2 text-gray-200">{banner.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                currentBannerIndex === index
                  ? "bg-white w-6"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
