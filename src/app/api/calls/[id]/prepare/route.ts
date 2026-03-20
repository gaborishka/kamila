import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTosData, searchRedditTips, searchConsumerRights } from "@/lib/firecrawl";
import type { Prisma } from "@prisma/client";

interface PrepStep {
  id: string;
  label: string;
  status: string;
  snippet: string | null;
}

function updateSteps(
  steps: PrepStep[],
  completed: Record<string, string | null>,
  activeId?: string,
): Prisma.InputJsonValue {
  return steps.map((s) => ({
    ...s,
    ...(completed[s.id] ? { status: "complete", snippet: completed[s.id] } : {}),
    ...(s.id === activeId ? { status: "active" } : {}),
  })) as unknown as Prisma.InputJsonValue;
}

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

    const companyName = call.companyName;
    const companyUrl = call.companyUrl;
    const steps = (call.prepSteps as unknown as PrepStep[]) || [];
    const done: Record<string, string | null> = {};

    // Step 1: Extract Terms of Service
    await prisma.call.update({
      where: { id },
      data: { prepSteps: updateSteps(steps, done, "tos") },
    });

    let tosData = null;
    if (companyUrl) {
      try {
        tosData = await extractTosData(companyUrl);
      } catch (e) {
        console.error("TOS extraction failed:", e);
      }
    }

    done.tos = tosData ? `Found refund policy data for ${companyName}` : "Using general consumer rights framework";

    await prisma.call.update({
      where: { id },
      data: {
        tosData: tosData || { note: "Could not extract TOS — will use general consumer rights" },
        prepSteps: updateSteps(steps, done, "reddit"),
      },
    });

    // Step 2: Search Reddit for tips
    let redditTips: string[] = [];
    try {
      const results = await searchRedditTips(companyName);
      redditTips = results
        .map((r) => ("markdown" in r && r.markdown) || ("description" in r && r.description) || "")
        .filter(Boolean)
        .slice(0, 3);
    } catch (e) {
      console.error("Reddit search failed:", e);
    }

    done.reddit = `Identified ${redditTips.length} successful precedents for similar complaints.`;

    await prisma.call.update({
      where: { id },
      data: {
        redditTips,
        prepSteps: updateSteps(steps, done, "legal"),
      },
    });

    // Step 3: Search consumer rights
    let consumerRights: string[] = [];
    try {
      const results = await searchConsumerRights(companyName);
      consumerRights = results
        .map((r) => ("markdown" in r && r.markdown) || ("description" in r && r.description) || "")
        .filter(Boolean)
        .slice(0, 3);
    } catch (e) {
      console.error("Consumer rights search failed:", e);
    }

    done.legal = `Found consumer protection frameworks applicable to ${companyName}.`;

    await prisma.call.update({
      where: { id },
      data: {
        consumerRights,
        prepSteps: updateSteps(steps, done, "building"),
      },
    });

    // Step 4: Build arguments
    const args = [];
    if (tosData) {
      args.push({
        id: "tos-refund",
        title: "Terms of Service: Refund Policy",
        description: `Refund policy details extracted from ${companyName}'s Terms of Service`,
        source: "tos",
        used: false,
      });
    }
    if (redditTips.length > 0) {
      args.push({
        id: "reddit-strategy",
        title: "Community-Proven Strategy",
        description: "Strategies that worked for other customers in similar situations",
        source: "reddit",
        used: false,
      });
    }
    if (consumerRights.length > 0) {
      args.push({
        id: "consumer-rights",
        title: "Consumer Protection Rights",
        description: "Applicable consumer protection laws and regulations",
        source: "legal",
        used: false,
      });
    }

    done.building = `Case built with ${args.length} arguments ready.`;

    await prisma.call.update({
      where: { id },
      data: {
        arguments: args,
        strategy: `Will present the case citing ${companyName}'s own Terms of Service. If denied, will escalate with consumer protection laws and proven negotiation strategies.`,
        prepSteps: updateSteps(steps, done, "dialing"),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Preparation failed:", error);
    return NextResponse.json(
      { error: "Preparation failed" },
      { status: 500 }
    );
  }
}
