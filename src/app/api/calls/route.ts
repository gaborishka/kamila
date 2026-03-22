import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeCall } from "@/lib/db";
import { uploadReceipt } from "@/lib/blob";

export async function GET() {
  try {
    const calls = await prisma.call.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(calls.map(serializeCall));
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const companyName = formData.get("companyName") as string;
    const companyUrl = formData.get("companyUrl") as string | null;
    const supportPhone = formData.get("supportPhone") as string;
    const problemDescription = formData.get("problemDescription") as string;
    const customerName = formData.get("customerName") as string;
    const orderNumber = formData.get("orderNumber") as string | null;
    const file = formData.get("file") as File | null;

    if (!companyName || !supportPhone || !problemDescription || !customerName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl: string | undefined;

    if (file) {
      const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
      }
      try {
        fileUrl = await uploadReceipt(file);
      } catch (e) {
        console.warn("File upload failed (BLOB_READ_WRITE_TOKEN may not be set), skipping:", e);
      }
    }

    const call = await prisma.call.create({
      data: {
        companyName,
        companyUrl: companyUrl || null,
        supportPhone,
        problemDescription,
        customerName,
        orderNumber: orderNumber || null,
        fileUrl: fileUrl || null,
        prepSteps: [
          { id: "tos", label: "Reading their Terms of Service...", status: "pending", snippet: null },
          { id: "reddit", label: "Searching for refund strategies...", status: "pending", snippet: null },
          { id: "legal", label: "Finding legal requirements...", status: "pending", snippet: null },
          { id: "building", label: "Building your case...", status: "pending", snippet: null },
          { id: "review", label: "Reviewing your case...", status: "pending", snippet: null },
          { id: "dialing", label: "Dialing...", status: "pending", snippet: null },
        ],
      },
    });

    return NextResponse.json({ id: call.id });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json(
      { error: "Failed to create call" },
      { status: 500 }
    );
  }
}
