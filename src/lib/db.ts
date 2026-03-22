import { PrismaClient } from "@prisma/client";
import type { Call as PrismaCall, TranscriptMessage as PrismaTranscriptMessage } from "@prisma/client";
import type { Call, TranscriptMessage } from "@/types/call";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function serializeCall(call: PrismaCall): Call {
  return {
    id: call.id,
    status: call.status as Call["status"],
    companyName: call.companyName,
    companyUrl: call.companyUrl ?? undefined,
    supportPhone: call.supportPhone,
    problemDescription: call.problemDescription,
    customerName: call.customerName,
    orderNumber: call.orderNumber ?? undefined,
    fileUrl: call.fileUrl ?? undefined,
    tosData: (call.tosData as Record<string, unknown>) ?? undefined,
    redditTips: (call.redditTips as string[]) ?? undefined,
    consumerRights: (call.consumerRights as string[]) ?? undefined,
    arguments: (call.arguments as unknown as Call["arguments"]) ?? undefined,
    prepSteps: (call.prepSteps as unknown as Call["prepSteps"]) ?? undefined,
    strategy: call.strategy ?? undefined,
    missingInfo: (call.missingInfo as Call["missingInfo"]) ?? undefined,
    additionalInfo: (call.additionalInfo as Record<string, string>) ?? undefined,
    agentId: call.agentId ?? undefined,
    conversationId: call.conversationId ?? undefined,
    result: call.resultType
      ? {
          type: call.resultType as "success" | "partial" | "failed",
          amount: call.resultAmount ?? undefined,
          currency: call.resultCurrency ?? undefined,
          operatorName: call.operatorName ?? undefined,
          referenceNumber: call.referenceNumber ?? undefined,
          summary: call.resultSummary ?? undefined,
        }
      : undefined,
    audioUrl: call.audioUrl ?? undefined,
    createdAt: call.createdAt.getTime(),
    updatedAt: call.updatedAt?.getTime(),
    callStartedAt: call.callStartedAt?.getTime(),
    callEndedAt: call.callEndedAt?.getTime(),
  };
}

export function serializeTranscript(msg: PrismaTranscriptMessage): TranscriptMessage {
  return {
    id: msg.id,
    speaker: msg.speaker as "kamila" | "operator",
    text: msg.text,
    timestamp: msg.timestamp,
    citedTos: msg.citedTos,
  };
}
