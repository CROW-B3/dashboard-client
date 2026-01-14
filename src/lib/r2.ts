import type { PutObjectCommandOutput } from "@aws-sdk/client-s3";
import type { Buffer } from "node:buffer";
import { env } from "node:process";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { logger } from "@/lib/logger";

interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

function getR2EnvVariable(key: string): string | undefined {
  return env[key];
}

function getR2Config(): R2Config {
  const accountId = getR2EnvVariable("CLOUDFLARE_ACCOUNT_ID");
  const accessKeyId = getR2EnvVariable("CLOUDFLARE_R2_ACCESS_KEY");
  const secretAccessKey = getR2EnvVariable("CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  const bucketName = getR2EnvVariable("CLOUDFLARE_R2_STORAGE_BUCKET");
  const publicUrl = getR2EnvVariable("NEXT_PUBLIC_R2_PUBLIC_URL");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing required R2 configuration");
  }

  return {
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    bucketName,
    ...(publicUrl && { publicUrl }),
  };
}

function getR2Client(): [S3Client, string] {
  const config = getR2Config();

  const client = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return [client, config.bucketName];
}

export function generatePublicUrl(
  filePath: string,
  publicUrlBase: string,
): string {
  return `${publicUrlBase}/${filePath}`;
}

export async function uploadFile(
  file: Buffer,
  filePath: string,
): Promise<PutObjectCommandOutput> {
  const [client, bucketName] = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    Body: file,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error: unknown) {
    logger.error({ err: error, filePath }, "Error uploading file to R2");
    throw error;
  }
}
