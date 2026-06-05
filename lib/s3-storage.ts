import { createHash, createHmac, randomUUID } from "crypto";

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

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function toDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

async function fetchImds(path: string, token?: string) {
  const response = await fetch(`http://169.254.169.254/latest/${path}`, {
    headers: token ? { "x-aws-ec2-metadata-token": token } : undefined,
    signal: AbortSignal.timeout(1500),
  });

  if (!response.ok) throw new Error(`IMDS request failed: ${response.status}`);
  return response.text();
}

async function getImdsToken() {
  try {
    const response = await fetch("http://169.254.169.254/latest/api/token", {
      method: "PUT",
      headers: { "x-aws-ec2-metadata-token-ttl-seconds": "21600" },
      signal: AbortSignal.timeout(1500),
    });

    return response.ok ? response.text() : undefined;
  } catch {
    return undefined;
  }
}

async function getAwsRegion() {
  if (regionCache) return regionCache;

  try {
    const token = await getImdsToken();
    regionCache = (await fetchImds("meta-data/placement/region", token)).trim();
    return regionCache;
  } catch {
    return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
  }
}

async function getEc2IamRoleCredentials(): Promise<AwsCredentials> {
  if (credentialCache.value?.expiration && credentialCache.value.expiration > Date.now() + 60_000) {
    return credentialCache.value;
  }

  const token = await getImdsToken();
  const roleName = (await fetchImds("meta-data/iam/security-credentials/", token)).trim().split("\n")[0];
  const credentialsResponse = await fetchImds(`meta-data/iam/security-credentials/${roleName}`, token);
  const credentials = JSON.parse(credentialsResponse) as { AccessKeyId: string; SecretAccessKey: string; Token?: string; Expiration?: string };

  credentialCache.value = {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.Token,
    expiration: credentials.Expiration ? new Date(credentials.Expiration).getTime() : Date.now() + 5 * 60 * 1000,
  };

  return credentialCache.value;
}

async function getAwsCredentials(): Promise<AwsCredentials> {
  try {
    return await getEc2IamRoleCredentials();
  } catch (error) {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      return {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      };
    }

    throw new Error(`No se pudieron obtener credenciales del IAM Role de EC2 para S3. Verifica que la instancia tenga un IAM Role con permisos al bucket ${getBucketName()}. ${error instanceof Error ? error.message : ""}`.trim());
  }
}

async function signS3Request(method: "GET" | "PUT", key: string, body?: Buffer, contentType?: string) {
  const bucket = getBucketName();
  const region = await getAwsRegion();
  const credentials = await getAwsCredentials();
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = toDateStamp(now);
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const payloadHash = sha256(body ?? "");
  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (contentType) headers["content-type"] = contentType;
  if (credentials.sessionToken) headers["x-amz-security-token"] = credentials.sessionToken;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((header) => `${header}:${headers[header]}\n`).join("");
  const canonicalRequest = [method, `/${encodeKey(key)}`, "", canonicalHeaders, signedHeaderNames.join(";"), payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${credentials.secretAccessKey}`, dateStamp), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames.join(";")}, Signature=${signature}`;

  return {
    url: `https://${host}/${encodeKey(key)}`,
    headers,
  };
}

export async function uploadImageToS3(file: File, folder: "ventas" | "notas"): Promise<StoredImage> {
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("La imagen no puede pesar más de 10 MB.");

  const originalName = sanitizeFileName(file.name || "imagen");
  const key = `${folder}/${randomUUID()}-${originalName}`;
  const body = Buffer.from(await file.arrayBuffer());
  const signedRequest = await signS3Request("PUT", key, body, file.type || "application/octet-stream");
  const response = await fetch(signedRequest.url, {
    method: "PUT",
    headers: signedRequest.headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`No se pudo subir la imagen a S3 (${response.status}). ${errorText}`.trim());
  }

  return { ubicacion: key, nombre: originalName };
}

export async function getImageFromS3(key: string) {
  const signedRequest = await signS3Request("GET", key);
  return fetch(signedRequest.url, { headers: signedRequest.headers });
}

export function getMediaUrl(ubicacion?: string | null) {
  return ubicacion ? `/api/media/${encodeKey(ubicacion)}` : "";
}
