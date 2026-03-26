import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadReceipt(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;

  // Local dev: save to public/uploads, serve via Next.js static files
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }

  // Production: Vercel Blob
  const blob = await put(`receipts/${filename}`, file, { access: "public" });
  return blob.url;
}
