/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash, randomUUID } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StoredImage = {
  ubicacion: string;
  nombre: string;
};

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: number;
};

const DEFAULT_BUCKET = "crm-im-bucket-mysql";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const credentialCache: { value?: AwsCredentials } = {};
let regionCache: string | undefined;

function getBucketName() {
  return process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || DEFAULT_BUCKET;
}

function sanitizeFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safe || "imagen";
}

function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

let s3Client: S3Client | undefined;

function getS3Client() {
  if (s3Client) return s3Client;
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
  s3Client = new S3Client({ region });
  return s3Client;
}

export async function uploadImageToS3(file: File, folder: "ventas" | "notas"): Promise<StoredImage> {
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("La imagen no puede pesar más de 10 MB.");

  const originalName = sanitizeFileName(file.name || "imagen");
  const key = `${folder}/${randomUUID()}-${originalName}`;
  const body = Buffer.from(await file.arrayBuffer());

  const client = getS3Client();
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
        ContentLength: body.length,
      })
    );
  } catch (err: any) {
    const msg = err?.message || String(err);
    throw new Error(`No se pudo subir la imagen a S3. ${msg}`);
  }

  return { ubicacion: key, nombre: originalName };
}

export async function getImageFromS3(key: string) {
  const client = getS3Client();
  const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: getBucketName(), Key: key }), { expiresIn: 300 });
  return fetch(url);
}

export async function createPresignedPutUrl(originalName: string, folder: "ventas" | "notas", contentType: string, expiresIn = 900) {
  const name = sanitizeFileName(originalName || "imagen");
  const key = `${folder}/${randomUUID()}-${name}`;
  const client = getS3Client();
  const command = new PutObjectCommand({ Bucket: getBucketName(), Key: key, ContentType: contentType || "application/octet-stream" });
  const url = await getSignedUrl(client, command, { expiresIn });
  return { url, key, nombre: name };
}

export function getMediaUrl(ubicacion?: string | null) {
  return ubicacion ? `/api/media/${encodeKey(ubicacion)}` : "";
}
