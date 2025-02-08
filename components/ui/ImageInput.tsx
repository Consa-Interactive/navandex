"use client";

import { useImageUpload } from "@/hooks/useImageUpload";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageInputProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  error?: string;
  height?: string;
}

export default function ImageInput({
  value,
  onChange,
  className = "",
  label,
  error: externalError,
  height = "min-h-[200px]",
}: ImageInputProps) {
  const {
    uploadImage,
    deleteImage,
    isUploading,
    error: uploadError,
  } = useImageUpload({
    onSuccess: (url) => onChange(url),
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await uploadImage(file);
      }
    },
    [uploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleRemove = async () => {
    if (value) {
      const success = await deleteImage(value);
      if (success) {
        onChange("");
      }
    }
  };

  const error = externalError || uploadError;

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}
      <div
        {...getRootProps()}
        className={`relative flex ${height} cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/20"
            : error
            ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/20"
            : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
        }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploading...
            </p>
          </div>
        ) : value ? (
          <div className="relative aspect-square w-full max-w-[200px]">
            <Image
              src={value}
              alt="Preview"
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload
              className={`h-8 w-8 ${error ? "text-red-500" : "text-gray-400"}`}
            />
            <p
              className={`text-center text-sm ${
                error
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here, or click to select"}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
