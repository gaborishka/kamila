import { put } from "@vercel/blob";

export async function uploadReceipt(file: File): Promise<string> {
  const filename = `receipts/${Date.now()}-${file.name}`;
  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}
