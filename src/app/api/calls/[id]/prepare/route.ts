import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { extractTosData, searchRedditTips, searchConsumerRights } from "@/lib/firecrawl";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const callRef = getAdminDb().collection("calls").doc(id);
    const callDoc = await callRef.get();

    if (!callDoc.exists) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const callData = callDoc.data();
    if (!callData) {
      return NextResponse.json({ error: "Call data is empty" }, { status: 404 });
    }
    const companyName = callData.companyName;
    const companyUrl = callData.companyUrl;

    // Step 1: Extract Terms of Service
    await callRef.update({
      "prepSteps": callData.prepSteps.map((s: { id: string }) =>
        s.id === "tos" ? { ...s, status: "active" } : s
      ),
    });

    let tosData = null;
    if (companyUrl) {
      try {
        tosData = await extractTosData(companyUrl);
      } catch (e) {
        console.error("TOS extraction failed:", e);
      }
    }

    await callRef.update({
      tosData: tosData || { note: "Could not extract TOS — will use general consumer rights" },
      "prepSteps": callData.prepSteps.map((s: { id: string }) =>
        s.id === "tos"
          ? { ...s, status: "complete", snippet: tosData ? `Found refund policy data for ${companyName}` : "Using general consumer rights framework" }
          : s.id === "reddit"
          ? { ...s, status: "active" }
          : s
      ),
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

    await callRef.update({
      redditTips,
      "prepSteps": callData.prepSteps.map((s: { id: string }) =>
        s.id === "reddit"
          ? { ...s, status: "complete", snippet: `Identified ${redditTips.length} successful precedents for similar complaints.` }
          : s.id === "legal"
          ? { ...s, status: "active" }
          : s.id === "tos"
          ? { ...s, status: "complete", snippet: tosData ? `Found refund policy data for ${companyName}` : "Using general consumer rights framework" }
          : s
      ),
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

    await callRef.update({
      consumerRights,
      "prepSteps": callData.prepSteps.map((s: { id: string }) =>
        s.id === "legal"
          ? { ...s, status: "complete", snippet: `Found consumer protection frameworks applicable to ${companyName}.` }
          : s.id === "building"
          ? { ...s, status: "active" }
          : s.id === "tos"
          ? { ...s, status: "complete", snippet: tosData ? `Found refund policy data for ${companyName}` : "Using general consumer rights framework" }
          : s.id === "reddit"
          ? { ...s, status: "complete", snippet: `Identified ${redditTips.length} successful precedents.` }
          : s
      ),
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

    await callRef.update({
      arguments: args,
      strategy: `Will present the case citing ${companyName}'s own Terms of Service. If denied, will escalate with consumer protection laws and proven negotiation strategies.`,
      "prepSteps": callData.prepSteps.map((s: { id: string }) =>
        s.id === "building"
          ? { ...s, status: "complete", snippet: `Case built with ${args.length} arguments ready.` }
          : s.id === "dialing"
          ? { ...s, status: "active" }
          : s.id === "tos"
          ? { ...s, status: "complete" }
          : s.id === "reddit"
          ? { ...s, status: "complete" }
          : s.id === "legal"
          ? { ...s, status: "complete" }
          : s
      ),
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
