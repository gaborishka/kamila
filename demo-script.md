# KAMILA Demo Video — "Behind Every Famous Deal"

**Format:** 60-90 sec viral video for ElevenHacks Hack #1 (Firecrawl + ElevenAgents)
**Tone:** Deadpan comedy × product demo. Absurd premise, real product.
**Concept:** Kamila — AI that handles any negotiation. Turns out she was behind the biggest deals in history.

---

## COLD OPEN — FAMOUS DEALS MONTAGE (0:00–0:18)

**[Dark screen. Text fades in. No voiceover — just text + UI flashes + ambient music.]**

**Text:** *"In 2025, an AI negotiator handled some of the world's toughest cases."*

---

**[FLASH 1 — Kamila screen, 3 sec]**
Input field: *"Overpaid $44B for a social media company. Want money back."*

**[FLASH 2 — Kamila screen, 3 sec]**
Input field: *"$200B in military aid. No return policy. Want refund."*

**[FLASH 3 — Kamila screen, 3 sec]**
Input field: *"Gave away my swamp. Terms were unclear. Want it back."*

---

**[Beat. Black screen.]**

**Voiceover** (Kamila's voice, calm, confident):
> *"She handles any case."*

**[Beat.]**

> *"Even yours."*

---

## MAIN DEMO — THE REAL CASE (0:18–1:05)

**[SCREEN: Kamila app — New Call page. Someone types:]**
- **Company:** "FitLife Gym"
- **Problem:** "Tried to cancel membership 3 times. They keep charging me $49.99/month."
- **Clicks "Call for me"**

---

### Preparation (0:23–0:30)

**[SCREEN: Kamila preparation screen — real UI]**

Steps appear fast:
1. *"Reading FitLife Terms of Service..."* → **Firecrawl JSON Extract**
2. *"Searching cancellation experiences..."* → **Firecrawl Search** (Reddit)
3. *"Building your case..."*

**Snippet pops up:**
> "Section 12.3 — no clause requires in-person cancellation."

4. *"Dialing..."*

---

### The Call (0:30–0:58)

**[SCREEN: Live call — transcript on left, "Kamila's Arsenal" sidebar on right]**

**Kamila** (confident, professional):
> "Hi, I'm calling on behalf of a member regarding account cancellation."

**Operator** (pushback):
> "Unfortunately, our policy requires cancellation in person at the branch."

**[Sidebar flashes: "No in-person requirement in ToS ✓"]**

**Kamila:**
> "I've reviewed your Terms of Service. Section 12.3 requires written notice — not in-person visit. My client provided that. Also, under FTC guidelines, cancellation must be as easy as signup. My client signed up online."

**Operator** (pause):
> "...Let me check with my supervisor."

**[Hold music. Transcript: "On hold..." — 2 sec]**

**Operator:**
> "We'll process the cancellation and refund the last two charges."

**Kamila:**
> "Confirmed. Full cancellation plus $99.98 refund. Can I get a confirmation number?"

---

## RESULT (0:55–1:05)

**[SCREEN: Kamila result page]**

```
Result: SUCCESS ✓
Resolution: Membership cancelled + 2 months refunded
Amount: $99.98
Arguments used: 3 of 4
  ✓ Terms of Service Section 12.3
  ✓ FTC cancellation guidelines
  ✓ Signup method precedent
Call duration: 2m 34s
```

---

## CTA (1:05–1:20)

**[Black screen. Text:]**

*"Kamila handles any negotiation."*

*"$44 billion mergers. $200 billion deals. One swamp."*

**[Beat.]**

*"And yes — your gym membership too."*

**[Kamila logo]**

*"Try Kamila."*

**[Small text, last frame — Trump-style caption:]**
*"[reluctant, almost impressed] Not bad. [dismissive, ego kicks in] But I'm never using an app called Kamala. [dead serious] Believe me."*

**[Text: "Built with @firecrawl and @elevenlabs | #ElevenHacks"]**

---

## TECHNICAL NOTES

### Why this format works for the hackathon:

**Viral potential:**
- Famous deals montage = instant hook, shareable
- Each "flash" is a meme on its own — screenshottable for Twitter
- "Kamala" punchline rewards those who get it
- Universal pain (gym membership) = everyone relates

**Judge-friendly:**
- Main demo is a clean, real product showcase
- Every feature of Firecrawl and ElevenAgents is visible
- No voice cloning of real people — only stock ElevenLabs voices
- Political references are text-only, subtle, deniable

### Voices used:
| Element | Voice | Source |
|---------|-------|--------|
| Kamila (agent) | Professional female | ElevenLabs Agent voice |
| Gym operator | Standard support voice | ElevenLabs Agent (controlled) |
No voiceover narrator — cold open is TEXT ON SCREEN only with ambient music.
No politician voices cloned. All political references are TEXT ON SCREEN only.

### Firecrawl features demonstrated:
1. **JSON Extract** — parsing gym Terms of Service as structured data
2. **Search + Scrape** — finding Reddit cancellation experiences
3. **Search as server tool** — agent searches during live call
4. **Actions** — navigating past cookie popups on ToS pages

### ElevenLabs features demonstrated:
1. **Agents API** — Kamila making outbound call
2. **Dynamic Variables** — member name, problem, company
3. **Conversation Analysis** — auto-evaluating SUCCESS
4. **Data Collection** — resolution type, amount, confirmation #
5. **React SDK** — live transcript on screen
6. **System Tools** — end_call after resolution

### The layers:
1. **Hook:** "Kamila was behind the biggest deals" — absurd, funny, shareable
2. **Product:** Full demo of real Kamila on a real use case
3. **Contrast:** $200B deals → $49.99 gym membership
4. **Trust:** AI doesn't always win (montage shows "partial"), but always fights
5. **Easter egg:** "Kamala" punchline for those paying attention
6. **Scaling:** Format works as a series — new "famous deals" each video
