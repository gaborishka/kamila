# Kamila

AI calls customer support for you. Reads their Terms of Service, finds legal loopholes, and fights for your refund.

## Before writing any code
1. Read `spec.md` — it has everything: architecture, APIs, code examples
2. Look at every image in `/design` — this is the target UI

## Tech
Next.js (App Router) + Tailwind on Vercel. Firebase (Firestore, Cloud Functions, Storage) for backend. ElevenLabs Agents API for voice (outbound calls). Firecrawl for Terms of Service extraction and Reddit search. Twilio for outbound telephony.

## Structure
```
/design    — UI mockups (PNG)
spec.md    — full product spec
```
