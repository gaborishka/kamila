import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";

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

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `receipts/${Date.now()}-${file.name}`;
      const bucket = getAdminStorage().bucket();
      const fileRef = bucket.file(fileName);
      await fileRef.save(buffer, { contentType: file.type });
      const [signedUrl] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      fileUrl = signedUrl;
    }

    const callData = {
      status: "preparing",
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
        { id: "dialing", label: "Dialing...", status: "pending", snippet: null },
      ],
      createdAt: Date.now(),
    };

    const callRef = await getAdminDb().collection("calls").add(callData);

    return NextResponse.json({ id: callRef.id });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json(
      { error: "Failed to create call" },
      { status: 500 }
    );
  }
}
