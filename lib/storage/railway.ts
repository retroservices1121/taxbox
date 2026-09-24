import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function client(): S3Client {
  return new S3Client({
    endpoint: env("AWS_ENDPOINT_URL"),
    region: process.env.AWS_DEFAULT_REGION ?? "auto",
    forcePathStyle: true,
    credentials: {
      accessKeyId: env("AWS_ACCESS_KEY_ID"),
      secretAccessKey: env("AWS_SECRET_ACCESS_KEY")
    }
  });
}

function bucket(): string {
  return env("AWS_S3_BUCKET_NAME");
}

export async function putRailwayObject(key: string, bytes: Buffer, contentType = "application/octet-stream") {
  await client().send(new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: bytes,
    ContentType: contentType
  }));
}

export async function getRailwayObject(key: string): Promise<Buffer> {
  const response = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!response.Body) throw new Error("Object body was empty");
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function deleteRailwayObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
