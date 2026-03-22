export type CallStatus = "preparing" | "live" | "completed";
export type CallResult = "success" | "partial" | "failed";
export type PrepStepStatus = "pending" | "active" | "complete";

export interface PrepStep {
  id: string;
  label: string;
  status: PrepStepStatus;
  snippet?: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: "kamila" | "operator";
  text: string;
  timestamp: number;
  citedTos?: boolean;
}

export interface Argument {
  id: string;
  title: string;
  description: string;
  source: "tos" | "reddit" | "legal";
  used: boolean;
}

export interface ClientQuestion {
  id: string;
  callId: string;
  question: string;
  answer?: string;
  createdAt: number;
  answeredAt?: number;
}

export interface Call {
  id: string;
  status: CallStatus;
  companyName: string;
  companyUrl?: string;
  supportPhone: string;
  problemDescription: string;
  customerName: string;
  orderNumber?: string;
  fileUrl?: string;

  // Preparation data
  tosData?: Record<string, unknown>;
  redditTips?: string[];
  consumerRights?: string[];
  arguments?: Argument[];

  // ElevenLabs
  agentId?: string;
  conversationId?: string;

  // Prep steps for UI
  prepSteps?: PrepStep[];

  // Strategy
  strategy?: string;

  // Result
  result?: {
    type: CallResult;
    amount?: number;
    currency?: string;
    operatorName?: string;
    referenceNumber?: string;
    summary?: string;
  };

  // Media
  audioUrl?: string;
  transcript?: TranscriptMessage[];

  // Timestamps
  createdAt: number;
  updatedAt?: number;
  callStartedAt?: number;
  callEndedAt?: number;
}
