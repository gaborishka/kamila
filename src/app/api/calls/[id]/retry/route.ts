import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const call = await prisma.call.findUnique({ where: { id } });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Create a new call with the same input data
    const newCall = await prisma.call.create({
      data: {
        companyName: call.companyName,
        companyUrl: call.companyUrl,
        supportPhone: call.supportPhone,
        problemDescription: call.problemDescription,
        customerName: call.customerName,
        orderNumber: call.orderNumber,
        language: call.language,
        fileUrl: call.fileUrl,
        userId: call.userId,
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

    return NextResponse.json({ id: newCall.id });
  } catch (error) {
    console.error("Retry failed:", error);
    return NextResponse.json({ error: "Failed to retry" }, { status: 500 });
  }
}
