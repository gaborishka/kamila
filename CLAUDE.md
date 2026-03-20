# Kamila

AI calls customer support for you. Reads their Terms of Service, finds legal loopholes, and fights for your refund.

## Before writing any code
1. Read `spec.md` — it has everything: architecture, APIs, code examples
2. Look at every image in `/design` — this is the target UI

## Tech
Next.js (App Router) + Tailwind on Vercel. Vercel Postgres (Prisma) for database. Vercel Blob for file storage. ElevenLabs Agents API for voice (outbound calls) + React SDK for live transcript. Firecrawl for Terms of Service extraction and Reddit search. Twilio for outbound telephony. Single `vercel deploy`.

## Structure
```
/design         — UI mockups (PNG)
/prisma         — database schema (Prisma)
spec.md         — full product spec
```

## Database
Run `npx prisma db push` to sync schema. Run `npx prisma studio` to browse data.
