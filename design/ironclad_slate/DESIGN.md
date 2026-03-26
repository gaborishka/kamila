# Design System Strategy: The Relentless Advocate

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Verdict"**

This design system is built to bridge the gap between high-stakes legal precision and consumer-facing accessibility. While most financial tools settle for "friendly," this system opts for **Authoritative Reliability**. It is designed to feel "relentless"—as if a high-powered attorney is working 24/7 inside the user's phone.

To break the "standard SaaS template" look, we move away from rigid boxes. We utilize **Intentional Asymmetry** and **Editorial Scale**. Large, high-contrast typography creates an immediate sense of hierarchy, while overlapping surfaces and "Ghost Borders" provide a sophisticated depth that feels custom-built rather than assembled from a kit.

## 2. Colors & Surface Logic

Our palette is anchored in deep, authoritative blues (`primary`), punctuated by "Action Orange" (`tertiary`) and "Success Green" (`secondary`). 

### The "No-Line" Rule
Traditional UI relies on 1px borders to separate content. This system **prohibits** 1px solid borders for sectioning. Boundaries must be defined solely through:
*   **Background Color Shifts:** Use a `surface-container-low` section sitting directly on a `surface` background.
*   **Nesting & Tonal Hierarchy:** Treat the UI as stacked sheets of fine paper. An inner card should be `surface-container-lowest` placed upon a `surface-container` background to create a natural, "physical" lift.

### Glass & Gradient Signature
To move beyond a flat "B2C" look, main CTAs and Hero sections should utilize **The Signature Texture**:
*   **Primary Gradients:** Transitioning from `primary` (#0040a1) to `primary_container` (#0056d2) at a 135-degree angle.
*   **Glassmorphism:** For floating status indicators or navigation bars, use `surface` colors at 80% opacity with a `20px` backdrop-blur. This ensures the "relentless" data streams feel integrated into the environment.

## 3. Typography: The Authoritative Voice

We utilize **Inter** for its neutral, high-legibility architecture. The hierarchy is designed to feel like a modern legal brief: bold, clear, and unyielding.

*   **Display (lg/md):** Reserved for high-impact numbers (e.g., "Total Refunded"). Use `on_surface` with `-0.02em` letter spacing for a "tight," premium feel.
*   **Headlines:** Your "Relentless" voice. Headlines should be used to state facts clearly.
*   **Titles:** Used for card headers. Always paired with `on_surface_variant` for a sophisticated contrast.
*   **Labels (md/sm):** These are our "metadata" layers. Use `label-md` in all-caps with `+0.05em` letter spacing for status indicators to evoke a sense of formal documentation.

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through **Tonal Layering** rather than structural shadows.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   *Base:* `background` (#faf8ff)
    *   *Section:* `surface-container-low` (#f2f3ff)
    *   *Interactive Card:* `surface-container-lowest` (#ffffff)
*   **Ambient Shadows:** If a card must "float" (e.g., a modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(19, 27, 46, 0.06)`. The shadow color is a tint of `on_surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use the `outline_variant` token at **15% opacity**. 100% opaque borders are strictly forbidden as they clutter the "Editorial" aesthetic.

## 5. Components & Interaction

### Buttons
*   **Primary:** A gradient-filled container (`primary` to `primary_container`) with `on_primary` text. Use `rounded-md` (0.375rem) for a professional, "sharp but safe" feel.
*   **Secondary:** No background. Use a "Ghost Border" (outline-variant at 20%) with `primary` text.
*   **Tertiary (The 'Action' Trigger):** Use `tertiary_container` for high-urgency actions like "File Dispute."

### Status Indicators (The Pulse)
Status is the heartbeat of this app. 
*   **Live/Connected:** Small `secondary` (green) dot with a soft 4px glow, paired with `label-md` text.
*   **Failed/Warning:** Use `error` (#ba1a1a) for failures and `tertiary` (orange) for pending actions.

### Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines between list items. Use `spacing-4` (1rem) of vertical white space or a subtle background toggle between `surface-container-low` and `surface-container-lowest`.
*   **Relentless Timeline:** A specialized component for this app. A vertical 2px track using `surface-variant` with "nodes" representing AI refund milestones.

### Input Fields
*   **Focus State:** When active, the "Ghost Border" transitions to a 2px `primary` border. The background should shift to `surface_container_lowest` to "highlight" the user's data entry.

## 6. Do’s and Don’ts

### Do
*   **Do use asymmetric margins:** Allow "Display" text to hang slightly off the standard grid to create an editorial, high-end feel.
*   **Do prioritize breathing room:** Use `spacing-10` (2.5rem) and `spacing-12` (3rem) to separate major sections.
*   **Do use high contrast for data:** Ensure refund amounts are always in `on_surface` or `primary` to stand out against the soft `surface` layers.

### Don't
*   **Don't use pure black:** Use `on_surface` (#131b2e) for all "black" text to maintain tonal depth.
*   **Don't use standard icons:** Use "Thin" or "Light" stroke weight icons (1.5pt) to match the Inter typography weight. Bold icons will break the premium feel.
*   **Don't use rounded-full for everything:** Reserve `rounded-full` for chips and tags only. Buttons and cards should stay at `md` (0.375rem) or `lg` (0.5rem) to maintain an "authoritative" structure.