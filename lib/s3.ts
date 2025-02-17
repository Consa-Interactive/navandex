import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Configure the S3 client for Contabo Object Storage
const s3Client = new S3Client({
  region: "eu2",
  endpoint: process.env.CONTABO_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CONTABO_ACCESS_KEY!,
    secretAccessKey: process.env.CONTABO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadFile(
  file: Buffer,
  originalName: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const randomString = Math.random().toString(36).substring(7);
  const key = `${timestamp}-${randomString}.${extension}`;

  try {
    // Format bucket name correctly
    const bucket = `${process.env.CONTABO_ACCOUNT_HASH}:navandex`;
    
    // Set proper ACL and content type
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: `image/${extension}`,
        ACL: "public-read",
        CacheControl: "max-age=31536000", // 1 year cache
        Metadata: {
          "x-amz-acl": "public-read"
        }
      })
    );

    // Return the properly formatted public URL
    return `https://eu2.contabostorage.com/${bucket}/${key}`;
  } catch (error) {
    console.error("Error uploading to Contabo:", error);
    throw new Error("Failed to upload file to storage");
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract bucket and key from URL
    const urlParts = url.replace('https://eu2.contabostorage.com/', '').split('/');
    const bucket = urlParts[0];
    const key = urlParts.slice(1).join('/');

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
  } catch (error) {
    console.error("Error deleting from Contabo:", error);
    throw new Error("Failed to delete file from storage");
  }
}

export default s3Client;
