# Kamila - Full Implementation Plan

## Overview
Build Kamila — an AI-powered customer support caller that reads Terms of Service, finds legal loopholes via Reddit/consumer rights, and calls support on behalf of the user to fight for refunds.

Full-stack Next.js 14 App Router + Tailwind CSS on Vercel. Firebase (Firestore, Cloud Functions, Storage) for backend. ElevenLabs Agents API for voice AI. Firecrawl for web scraping/search. Twilio for outbound telephony.

## Context
- Design mockups: 6 pages in `/stitch/` as Tailwind HTML
- Design system: `/stitch/ironclad_slate/DESIGN.md`
- Product spec: `/spec.md`
- No code exists yet — starting from scratch

## Development Approach
- **Testing approach**: Regular (code first, tests where meaningful for API routes)
- Complete each task fully before moving to the next
- Convert HTML mockups to React/Next.js components
- Use Firestore real-time listeners for live transcript (no WebSocket needed)
- All API integrations go through Next.js API routes (server-side)

## Progress Tracking
- Mark completed items with `[x]` immediately when done
- Add newly discovered tasks with ➕ prefix
- Document issues/blockers with ⚠️ prefix

## Implementation Steps

### Task 1: Initialize Next.js project with Tailwind and design system

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `.env.local.example`
- Create: `.gitignore`

- [ ] Initialize Next.js 14 with App Router, TypeScript, Tailwind CSS, src/ directory
- [ ] Configure tailwind.config.ts with full design system colors, fonts, borderRadius from stitch mockups
- [ ] Add globals.css with Material Symbols, glass-panel, ghost-border, text-editorial utilities
- [ ] Create .env.local.example with all required env vars
- [ ] Create root layout with Inter font import and base body classes
- [ ] Verify dev server starts

### Task 2: Shared components — Header, Footer

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`

- [ ] Create Header component matching stitch nav: logo "Kamila", History link, New Call button, account icon
- [ ] Create Footer component: logo, copyright, GitHub/Twitter links
- [ ] Wire Header navigation links (/, /call/new, /history)

### Task 3: Landing page

**Files:**
- Create: `src/app/page.tsx`

- [ ] Hero section: headline, subtext, CTA button, social proof avatars + stats
- [ ] Bento visual: phone → AI → money flow diagram
- [ ] Stats bar: success rate, active cases, avg hold time
- [ ] "How It Works" 3-step section
- [ ] "Why Kamila" dark section with feature list + relentless timeline
- [ ] Final CTA section

### Task 4: New Call page

**Files:**
- Create: `src/app/call/new/page.tsx`
- Create: `src/components/FileUpload.tsx`

- [ ] Left column: headline, stat card (avg wait time saved)
- [ ] Right column: form card with 3 sections (Company, Problem, Your Data)
- [ ] Section 01: Company name/URL + support phone number inputs
- [ ] Section 02: File upload drag-and-drop zone + problem description textarea
- [ ] Section 03: Name + order number inputs
- [ ] "Call for me" submit button with gradient styling
- [ ] FileUpload component with drag-and-drop, file preview, accepts PNG/JPG/PDF
- [ ] Form state management with useState

### Task 5: Firebase setup and configuration

**Files:**
- Create: `src/lib/firebase.ts` (client SDK)
- Create: `src/lib/firebase-admin.ts` (admin SDK)
- Create: `src/types/call.ts` (TypeScript types)

- [ ] Install firebase and firebase-admin packages
- [ ] Create client Firebase config (Firestore, Storage)
- [ ] Create admin Firebase config for API routes
- [ ] Define TypeScript interfaces: Call, CallStatus, TranscriptMessage, CallResult, PrepStep

### Task 6: API — Create call and upload files

**Files:**
- Create: `src/app/api/calls/route.ts` (POST)
- Create: `src/lib/storage.ts`

- [ ] POST /api/calls: validate input, create Firestore doc with status "preparing"
- [ ] Handle file upload to Firebase Storage, store download URL in call doc
- [ ] Return call ID for redirect to preparing page

### Task 7: API — Preparation pipeline (Firecrawl TOS + Reddit + consumer rights)

**Files:**
- Create: `src/app/api/calls/[id]/prepare/route.ts`
- Create: `src/lib/firecrawl.ts`

- [ ] Install @mendable/firecrawl-js
- [ ] Firecrawl JSON Extract: scrape company TOS URL, extract structured refund policy data
- [ ] Firecrawl Search: Reddit tips for company + refund success stories
- [ ] Firecrawl Search: consumer rights for relevant country/region
- [ ] Update Firestore doc with preparation steps in real-time (so UI can show progress)
- [ ] Store extracted TOS data, Reddit tips, and legal arguments in call doc

### Task 8: API — Create ElevenLabs agent and initiate outbound call

**Files:**
- Create: `src/app/api/calls/[id]/dial/route.ts`
- Create: `src/lib/elevenlabs.ts`

- [ ] Build agent system prompt from TOS data + Reddit scripts + consumer rights
- [ ] POST to ElevenLabs /v1/convai/agents/create with:
  - prompt, tools (firecrawl_search webhook), voice config
  - evaluation criteria, data collection fields
  - post-call webhook URL
- [ ] POST to ElevenLabs /v1/convai/twilio/outbound-call with:
  - agent_id, phone number, dynamic variables (name, order, problem)
- [ ] Update Firestore call status to "live"

### Task 9: API — Firecrawl search server tool (for ElevenLabs agent)

**Files:**
- Create: `src/app/api/tools/firecrawl-search/route.ts`

- [ ] POST endpoint that receives search query from ElevenLabs agent webhook
- [ ] Call Firecrawl Search API with the query
- [ ] Return formatted results back to the agent

### Task 10: API — ElevenLabs post-call webhook

**Files:**
- Create: `src/app/api/webhooks/elevenlabs/route.ts`

- [ ] Receive post-call webhook with conversation analysis, data collection, transcript
- [ ] Parse resolution_type, resolution_amount, operator_name, reference_number
- [ ] Store full transcript, analysis results, and audio URL in Firestore
- [ ] Update call status to "completed" with result (success/partial/failed)

### Task 11: Preparing Call page (real-time progress)

**Files:**
- Create: `src/app/call/[id]/preparing/page.tsx`
- Create: `src/hooks/useCallStatus.ts`

- [ ] Header with "Secure Session" indicator
- [ ] Pulsing icon + "Preparing your case" headline
- [ ] Left column: Relentless Strategy Engine with 5 steps (TOS, Reddit, Legal, Building case, Dialing)
- [ ] Each step shows: complete (green check), active (pulsing), or pending (greyed out)
- [ ] Show real snippets from Firecrawl results as they arrive
- [ ] Right column: estimated time card, legal insight card, secure connection indicator
- [ ] useCallStatus hook: Firestore onSnapshot listener for real-time step updates
- [ ] Auto-redirect to live call page when status changes to "live"
- [ ] Trigger /api/calls/[id]/prepare then /api/calls/[id]/dial on mount

### Task 12: Live Call page (real-time transcript)

**Files:**
- Create: `src/app/call/[id]/live/page.tsx`
- Create: `src/hooks/useTranscript.ts`

- [ ] Header with live indicator (pulsing green dot), timer, "End Call" button
- [ ] Left (8 cols): audio visualizer bar + live transcript canvas
- [ ] Transcript messages: Operator (left, grey avatar) and Kamila (right, blue avatar)
- [ ] TOS citations highlighted with special styling (bg-primary/20 border-b)
- [ ] Typing indicator (bouncing dots) for live response
- [ ] Right (4 cols): "Kamila's Arsenal" sidebar with argument cards
- [ ] Arguments marked as "Used" (green border + check) or "Ready" (grey border)
- [ ] "Kamila's Strategy" block at bottom of sidebar
- [ ] useTranscript hook: Firestore listener on transcript subcollection
- [ ] End Call button sends request to terminate conversation
- [ ] Auto-redirect to result page when call ends

### Task 13: Call Result page

**Files:**
- Create: `src/app/call/[id]/result/page.tsx`

- [ ] Hero: status badge (SUCCESS/PARTIAL/FAILED), headline, amount
- [ ] Summary bento grid: company info + call duration + status | audio recording card
- [ ] "Relentless Arguments Used" section with argument cards
- [ ] Full Transcript section with expandable view
- [ ] Sidebar: "Share your win" card with Twitter/Copy buttons
- [ ] "Next Steps" action cards (Verify Bank, View History)
- [ ] Escalation card (shown for partial/failed results)

### Task 14: History page

**Files:**
- Create: `src/app/history/page.tsx`
- Create: `src/hooks/useCallHistory.ts`

- [ ] Sidebar navigation (desktop): Dashboard, Call History, Live Demo, Legal Vault
- [ ] Mobile header + bottom nav bar
- [ ] Stats bento grid: total calls, success count, total recovered amount
- [ ] List of call cards with: company logo, name, status badge, date, description
- [ ] Each card: amount recovered + "View details" and "Call again" buttons
- [ ] SUCCESS (green), PARTIAL (orange), FAILED (red) status styling
- [ ] useCallHistory hook: Firestore query for user's calls ordered by date

### Task 15: Receipt/image processing with Gemini Vision

**Files:**
- Create: `src/lib/vision.ts`
- Modify: `src/app/api/calls/route.ts`

- [ ] Integrate Gemini Vision API to extract data from uploaded receipt/screenshot
- [ ] Extract: company name, amount, date, order number from image
- [ ] Auto-fill form fields or pass as dynamic variables to agent

### Task 16: Final polish and integration testing

**Files:**
- Modify: various files

- [ ] Verify all page navigation works end-to-end
- [ ] Verify Firestore real-time listeners update UI correctly
- [ ] Add loading states and error boundaries to all pages
- [ ] Add responsive design tweaks for mobile
- [ ] Verify all env vars are documented

### Task 17: Update documentation

- [ ] Update CLAUDE.md with project structure and patterns
- [ ] Move this plan to `docs/plans/completed/`

## Technical Details

### Firestore Schema
```
calls/{callId}
  - status: "preparing" | "live" | "completed"
  - companyName: string
  - companyUrl?: string
  - supportPhone: string
  - problemDescription: string
  - customerName: string
  - orderNumber?: string
  - fileUrl?: string
  - tosData?: object (extracted TOS)
  - redditTips?: array
  - consumerRights?: array
  - agentId?: string (ElevenLabs agent ID)
  - conversationId?: string
  - result?: { type: "success"|"partial"|"failed", amount?: number }
  - audioUrl?: string
  - createdAt: timestamp
  - prepSteps: { tos: status, reddit: status, legal: status, building: status, dialing: status }

calls/{callId}/transcript/{msgId}
  - speaker: "kamila" | "operator"
  - text: string
  - timestamp: timestamp
  - citedTos?: boolean
```

### ElevenLabs Agent Prompt Template
```
You are Kamila, a professional consumer rights advocate...
- Customer: {{customer_name}}
- Order: {{order_number}}
- Problem: {{problem_description}}
- Terms of Service key points: {{tos_data}}
- Reddit strategies: {{reddit_tips}}
- Consumer rights: {{consumer_rights}}
```

## Post-Completion
- Set up Firebase project and configure env vars
- Register Twilio phone number
- Get ElevenLabs API key with Agents access
- Get Firecrawl API key
- Deploy to Vercel
- Test with controlled call environment
