# Kamila

AI calls customer support for you. Reads their Terms of Service, finds legal loopholes, and fights for your refund.

> "Companies hide their refund rules in 50 pages of legal text hoping you won't read it. Kamila reads it in seconds and calls them for you."

## How it works

1. Upload your receipt or screenshot of the problem
2. Describe the issue ("Ordered pizza an hour ago, arrived cold, want a refund")
3. Enter the company's support phone number or website URL
4. Press **Call for me**
5. Kamila calls support, argues your case using their own Terms of Service, Reddit strategies, and consumer rights
6. You watch the live transcript and listen in real-time

## Tech stack

- **Next.js 16** (App Router) + **Tailwind CSS v4** on Vercel
- **Vercel Postgres** (Prisma) for database
- **Vercel Blob** for file storage
- **ElevenLabs Agents API** for voice (outbound calls) + React SDK for live transcript
- **Firecrawl** for Terms of Service extraction and Reddit search
- **Twilio** for outbound telephony
- **Gemini** for pre-call case analysis
- **NextAuth.js v5** for authentication (Google, GitHub)

## Getting started

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.local.example .env.local

# Set up the database
npm run db:setup    # starts Postgres via Docker + runs Prisma migrations

# Run development server
npm run dev         # starts Next.js + WebSocket server on :3000
```

## Environment variables

See `.env.local.example` for the full list. You'll need API keys for:

- Firecrawl, ElevenLabs, Gemini, Twilio
- Vercel Postgres + Blob tokens
- OAuth credentials (Google and/or GitHub)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Next.js + WebSocket) |
| `npm run build` | Production build |
| `npm run db:setup` | Start Postgres + push schema |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Push schema changes to database |

## Deploy

```bash
vercel --prod
```

Single `vercel deploy` — no extra infrastructure needed.
