import { useState } from "react";

interface UseImageUploadProps {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload({
  onSuccess,
  onError,
}: UseImageUploadProps = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      onSuccess?.(data.url);
      return data.url;
    } catch {
      const errorMessage = "Failed to upload image";
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      return true;
    } catch {
      const errorMessage = "Failed to delete image";
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    error,
    setError,
  };
}
