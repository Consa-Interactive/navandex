import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  defaultImage?: string;
  className?: string;
}

export default function ImageUpload({
  onUpload,
  defaultImage,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(defaultImage);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      try {
        setUploading(true);
        setError(null);

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Prepare form data
        const formData = new FormData();
        formData.append("file", file);

        // Upload to server
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onUpload(data.url);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image");
        setPreview(defaultImage);
      } finally {
        setUploading(false);
      }
    },
    [defaultImage, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const removeImage = () => {
    setPreview(undefined);
    onUpload("");
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragActive
            ? "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/20"
            : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploading...
            </p>
          </div>
        ) : preview ? (
          <div className="relative aspect-square w-full max-w-[200px]">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
