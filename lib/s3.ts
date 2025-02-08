import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "eu-central-1",
  endpoint: "https://hel1.your-objectstorage.com",
  credentials: {
    accessKeyId: process.env.HETZNER_ACCESS_KEY!,
    secretAccessKey: process.env.HETZNER_SECRET_KEY!,
  },
  forcePathStyle: true, // Use path-style URLs
});

export async function uploadFile(
  file: Buffer,
  originalName: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const randomString = Math.random().toString(36).substring(7);
  const key = `${timestamp}-${randomString}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.HETZNER_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: `image/${extension}`,
      ACL: "public-read",
      CacheControl: "max-age=31536000",
    })
  );

  return `https://hel1.your-objectstorage.com/${process.env.HETZNER_BUCKET_NAME}/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  const key = url.split("/").pop()!;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.HETZNER_BUCKET_NAME,
      Key: key,
    })
  );
}

export default s3Client;
