# Data Library App — Interaction Design Case Study

> Portfolio presentation for Google Interaction Designer interview
> Slide-by-slide outline with content, visual suggestions, and speaker notes

---

## ACT 1: CONTEXT

---

### Slide 1 — Title

**Title:** Designing Transparent AI Pipelines
**Subtitle:** Interaction design for Salesforce Data Library
**Details:** Your Name | Interaction Designer | Salesforce | 2025

**Visual:** Hero screenshot of the Library View with the pipeline status card in-progress — showing pulse animation on the active step, shimmer text, and files transitioning status.

**Speaker notes:**
This is a project I worked on at Salesforce — designing the interaction layer for Data Library, a tool that lets enterprise users upload files and process them through an AI-powered pipeline for indexing and agent integration. My focus was making the async, multi-step pipeline feel transparent and trustworthy through deliberate interaction design.

---

### Slide 2 — Problem

**Title:** The problem with invisible pipelines

**Content:**
- Enterprise AI products often involve multi-step backend processing — uploading, indexing, building retrievers, connecting agents
- Users initiate a pipeline, then face a black box: no indication of what's happening, how long it will take, or whether something went wrong
- This creates anxiety, distrust, and support tickets — users refresh, re-submit, or abandon the flow entirely

**Visual:** A simple before/after diagram — LEFT: a generic "Processing..." spinner with a question mark (opaque), RIGHT: the 5-step pipeline stepper showing clear progress (transparent).

**Speaker notes:**
The core problem is opacity. When users click "Save" and their files start processing, they're trusting the system with their data. If the UI goes silent during a 15-20 second pipeline, that trust erodes. Users don't know if it's working, how far along it is, or what just happened. I saw this as a pure interaction design challenge — how do we make an async pipeline feel alive, responsive, and legible?

---

### Slide 3 — Design challenge

**Title:** How do you make waiting feel like progress?

**Content:**
- 5 sequential pipeline steps, each taking 2-5 seconds
- Total processing time: ~17 seconds
- Users need to understand: what step is active, what's done, what's next, and whether something failed
- The interaction must degrade gracefully if the real-time connection drops

**Design question:** How do you communicate progress through a multi-step async pipeline so users never feel lost, even when the system is doing the work?

**Visual:** A flow diagram of the 5 pipeline steps in sequence: Uploading files → Creating search index → Setting up retriever → Building agent tool → Indexing data. Each with a time annotation (4s, 3s, 3s, 2s, 5s).

**Speaker notes:**
The challenge has layers. At the surface level, it's about progress visualization. But underneath, there are interaction design questions at every step — when should the UI auto-expand or collapse sections? How should individual file rows reflect pipeline progress? What happens when a step fails? What happens if the real-time connection drops? I'll walk through each of these decisions.

---

### Slide 4 — Scope and constraints

**Title:** Working within the system

**Content:**
- **Platform:** Salesforce enterprise ecosystem — Lightning Design System alignment (pill buttons, card patterns, status color conventions)
- **Users:** Data admins and AI builders who configure agent tools — technical but not engineers
- **Tech constraint:** Server-Sent Events for real-time updates, with no guarantee of connection stability
- **My role:** Interaction design, prototyping, design system contributions
- **Prototype:** Fully functional React prototype built for stakeholder alignment and engineering handoff

**Visual:** A layout anatomy diagram of the app: Global Header → Sidebar (collapsible) → App Header (tabs) → Main Content → Sticky Footer. Annotate each zone briefly.

**Speaker notes:**
A few things shaped my design decisions. This lives inside the Salesforce ecosystem, so I worked within their design language — pill-shaped buttons, card-based layouts, status color conventions. The users are technical but not engineers — they configure AI systems, so they need clarity without simplification. And a key constraint: the real-time pipeline updates use Server-Sent Events, which can drop. Every interaction I designed had to account for that.

---

## ACT 2: INTERACTION DESIGN DEEP DIVES

---

### Slide 5 — Pipeline stepper: the anatomy

**Title:** Designing a 5-step pipeline stepper

**Content:**
Each step has 4 possible states, communicated through a coordinated set of visual cues:

| State | Dot | Connector | Label | Description |
|-------|-----|-----------|-------|-------------|
| Default | Hollow circle, gray border | Dashed line | Normal weight, muted | Static |
| In-progress | Pulsing ring (teal glow, 2s infinite) + solid inner dot | Dashed line | Bold | Shimmer gradient sweep (3.5s) |
| Complete | Solid filled circle (teal) | Solid line (animated fill) | Bold | Static, optional action link |
| Error | Solid filled circle (red) | Dashed line | Bold, red | Error message + retry button |

**Visual:** A side-by-side comparison of the 4 dot states at actual size, annotated with the animation properties — pulse-ring keyframe, shimmer-sweep gradient, scale-y connector fill.

**Speaker notes:**
The pipeline stepper is the centerpiece of the interaction. Each of the five steps can be in one of four states. The key design decision was using multiple coordinated signals — not just color, but motion, weight, and text treatment — to communicate each state. A pulsing ring on the active step draws the eye. Shimmer text on the active description creates a sense of ongoing work. And the connector animation between steps gives a feeling of flow.

---

### Slide 6 — Pipeline stepper: the motion

**Title:** Motion as communication

**Content:**
Three animations work together to convey pipeline progress:

1. **Pulse ring** — A teal glow that radiates from the active dot (2s infinite loop, cubic-bezier easing). Draws attention to the current step without being distracting.

2. **Connector fill** — When a step completes, the dashed connector to the next step fills solid from top to bottom. Uses `scale-y` with `transform-origin: top` (700ms, cubic-bezier(0.22, 1, 0.36, 1)). The easing starts fast and decelerates — it feels like the progress is "arriving" at the next step.

3. **Shimmer text** — The active step's description uses a sweeping gradient via `background-clip: text` (3.5s infinite). This signals "the system is working" without an explicit loading indicator.

**Design decision:** I chose these three animations because each communicates a different aspect — attention (pulse), transition (connector), and activity (shimmer) — and they can all run simultaneously without competing.

**Visual:** A short video/GIF of the pipeline progressing through steps 1-3, with callout annotations on each animation.

**Speaker notes:**
Motion is doing real communicative work here. The pulse ring says "look here." The connector fill says "that step is done, this one is starting." The shimmer says "work is happening right now." I was deliberate about the easing curves — the connector fill uses a fast-start, slow-finish bezier so it feels like progress flowing forward and settling into the next step. All three animations run at different speeds so they don't sync up into a repetitive loop.

---

### Slide 7 — Pipeline stepper: completion links

**Title:** Progressive disclosure at each step

**Content:**
When each pipeline step completes, it reveals a contextual action link:

| Step | Completion link |
|------|----------------|
| Uploading files | — (no link) |
| Creating search index | "Search Index" (opens index) |
| Setting up retriever | "Retriever" / "Test Retriever" |
| Building agent tool | "Agent tool" (link to tool config) |
| Indexing data | — (triggers file-level status updates) |

**Design decision:** Links appear inline within the step description, using the primary blue color and underline-on-hover pattern. They're not announced with an animation — they simply appear when the step resolves. This avoids creating a "reward moment" at every step, keeping the user focused on overall completion rather than celebrating intermediary states.

**Visual:** Annotated screenshot of a completed pipeline stepper showing the inline links on steps 2, 3, and 4.

**Speaker notes:**
Each completed step optionally reveals a link to the artifact it produced. This is progressive disclosure — the search index link only exists once the index is built. I chose not to animate these in because I didn't want to create mini-celebrations at every step. The pipeline is a sequence, not a game. The links just quietly appear, available when the user needs them.

---

### Slide 8 — Collapsible metadata card

**Title:** Context-aware auto-collapse

**Content:**
The library metadata card (name, description, data space, API name) sits at the top of the Library View. Its collapse behavior is context-aware:

- **Default:** Expanded on entry — user sees full metadata
- **On scroll (>20px):** Auto-collapses to a compact bar showing library name + status badge
- **During processing:** Stays expanded regardless of scroll — don't hide context during the anxious waiting period
- **Manual toggle:** Chevron button lets users override in either direction
- **Collapsed state:** Single row with name + status badge inline, expandable on click

**Design rationale:** The metadata card takes significant vertical space. On scroll, it's clear the user wants to see the pipeline or files below. But during processing, collapsing it would remove context at the exact moment users are most anxious — so the auto-collapse is suppressed until the pipeline completes.

**Visual:** Three-frame storyboard: (1) Card expanded on entry, (2) Card auto-collapsed after scroll, (3) Card staying expanded during pipeline processing with a callout explaining why.

**Speaker notes:**
This is one of my favorite interaction details. The metadata card auto-collapses when you scroll down, which is standard progressive disclosure. But I added an exception: during pipeline processing, it stays open. The reasoning is empathetic — when users are waiting for their pipeline to finish, they're in an uncertain state. Collapsing the card that shows what they're processing would add to that uncertainty. Once processing completes, the normal scroll behavior resumes.

---

### Slide 9 — File upload interaction

**Title:** From dropzone to data table

**Content:**
The file upload area transitions through three distinct states:

1. **Empty state (dropzone):** Dashed border, upload icon, "Drag and drop files here" + browse button. Accepts .pdf, .html, .txt.
2. **Drag-over feedback:** Border shifts to ring color, background shifts to secondary — instant visual acknowledgment that the drop target is active.
3. **Files added (table):** The dropzone transforms into a files table with columns: File Name, Size, Status, AI Fixes, Uploaded By, Uploaded On. An "Add Files" button in the table header allows subsequent uploads.

**Key interaction:** The spatial transition from dropzone to table maintains the same screen position. The user's mental model isn't disrupted — "the upload zone became the files list" rather than "the upload zone disappeared and something new appeared."

**Visual:** Three-frame storyboard showing the dropzone → drag-over → files table transition, with the consistent spatial position highlighted.

**Speaker notes:**
File upload is a moment where users commit their content to the system. The interaction needs to feel confident. The drag-over feedback is immediate — border and background change on `dragEnter`, revert on `dragLeave`. The bigger decision was what happens after upload. Instead of showing the dropzone and a separate files list, the dropzone transforms into the files table in-place. This spatial continuity means the user doesn't need to reorient — the content they just uploaded appears exactly where they were looking.

---

### Slide 10 — Per-file status progression

**Title:** Files tell their own story

**Content:**
During the "Indexing data" pipeline step, each file row independently updates its status:

- **Uploaded** (default badge) → **Indexing** (processing badge, appears sequentially per file) → **Indexed** (success badge)

Files don't all flip at once — they update one by one with a staggered delay, matching the real behavior of an indexing system processing files sequentially.

**Why this matters:** A single "Indexing..." status on the pipeline stepper tells you the system is working. But individual file rows transitioning independently tells you *your specific files* are being processed. It transforms an abstract pipeline step into a concrete, tangible experience.

**Visual:** A files table with 4 files — file 1 and 2 showing "Indexed" (green), file 3 showing "Indexing" (blue), file 4 showing "Uploaded" (gray). Annotate the staggered timing.

**Speaker notes:**
This detail makes the abstract concrete. When the pipeline is at "Indexing data," the user could just see a single progress indicator. Instead, each file row in the table independently transitions through its own status — Uploaded, Indexing, Indexed — with staggered timing. Seeing "my specific file" move from Indexing to Indexed is more reassuring than any generic progress bar. It's the difference between "the system is doing something" and "the system is processing my Product Return Policy PDF right now."

---

### Slide 11 — Save button state machine

**Title:** Five states, one button

**Content:**
The Save button has a deliberate state machine:

```
[Disabled: no files] → user adds files → [Enabled: ready to save]
→ user clicks Save → [Saving...: loading state, disabled]
→ save completes → [Disabled: no unsaved changes]
→ user adds more files → [Enabled: new unsaved changes]
```

Additional behaviors:
- **Tooltip on disabled state:** "Add files to enable save" — always explain *why* something is disabled
- **Contextual footer swap:** When files are selected for removal, the footer changes from [Cancel | Save] to [Cancel | Remove Files (destructive red)]
- **During processing:** Save is disabled — can't re-save while the pipeline is running

**Design principle:** A disabled button without explanation is a dead end. A disabled button with a tooltip is a signpost.

**Visual:** A horizontal sequence of 5 button states, each labeled with the trigger that causes the transition. Include the tooltip callout on the disabled state.

**Speaker notes:**
Save buttons seem simple, but they're a common source of confusion in enterprise tools. "Why can't I save?" is a question users should never have to ask. Every disabled state has a tooltip explanation. And I introduced a contextual footer — when the user selects files for removal, the Save button is replaced with a destructive "Remove Files" button. This prevents the ambiguous state where users might think "Save" would save their removal intent.

---

### Slide 12 — AI Fixes modal

**Title:** Making AI recommendations legible

**Content:**
After files are processed, the AI generates data quality recommendations. Each file shows an "X fixes available" pill in the AI Fixes column.

The Suggested Fixes modal presents recommendations as a diff:

| Element | Treatment |
|---------|-----------|
| Issue detected | Red-tinted background row showing the problematic data |
| Suggested fix | Green-tinted background row showing the corrected data |
| Severity | Badge: Warning (amber) or Critical (red) |
| Confidence | Percentage score (74-97%) |
| Fixability | Safe / Review / Manual |
| Actions | Apply (accepts fix) or Dismiss (ignores fix) |

**Design decisions:**
- Diff-style red/green is a universally understood pattern (code review, track changes)
- Confidence scores build trust — users can see the AI isn't claiming certainty
- "Fixability" classification helps users prioritize: safe fixes can be auto-applied, manual ones need human judgment

**Visual:** Screenshot of the Suggested Fixes modal with 2-3 recommendations visible, annotated to highlight the diff styling, confidence score, and action buttons.

**Speaker notes:**
AI recommendations need to be transparent to be trusted. I used a diff-style presentation — red background for the issue, green for the suggested fix — because it's a pattern users already understand from code review and document track changes. Each recommendation also shows a confidence score and a fixability classification. This helps users make decisions: a 97% confidence "safe" fix is one-click. A 74% confidence "manual" fix gets human review. The goal is to make the AI's reasoning visible, not just its conclusions.

---

### Slide 13 — Agent Tool auto-expand

**Title:** Directing attention at the right moment

**Content:**
The Agent Tool card sits below the metadata section. Its expand behavior is tied to the pipeline:

- **Before pipeline completes step 4:** Card is collapsed (no agent tool exists yet)
- **When "Building agent tool" step completes:** Card auto-expands with the new retriever link
- **Signal pattern:** Uses a counter (not a boolean) to trigger expansion — this handles edge cases where the pipeline reruns on file re-upload

**Why a counter instead of a boolean?**
If the user manually collapses the card and then re-uploads files (triggering a new pipeline run), a boolean `shouldExpand = true` wouldn't re-trigger because it's already true. A counter incrementing from 2 to 3 fires the `useEffect` again, re-expanding the card at the right moment.

**Visual:** Two-frame sequence: (1) Agent Tool card collapsed during pipeline, (2) Card auto-expanded after step 4 completes, with the retriever link visible. Annotate the trigger event.

**Speaker notes:**
This is a small but considered interaction. The Agent Tool card auto-expands at exactly the moment the pipeline produces an agent tool. The timing is deliberate — not on page load, not on pipeline start, but on the specific step completion that makes the content relevant. The implementation detail I'm proud of is using a counter instead of a boolean for the expand signal. This handles the edge case where a user re-uploads files and the pipeline reruns — the counter increments, firing the expansion again even if the card was previously auto-expanded.

---

### Slide 14 — Graceful degradation

**Title:** When real-time fails, the experience doesn't

**Content:**
The pipeline updates stream via Server-Sent Events (SSE). But enterprise networks are unpredictable — firewalls, proxies, and VPNs can block SSE connections.

**Fallback strategy:**
1. On library view mount, open SSE connection to `/api/libraries/:id/status`
2. If the connection fails before receiving any data, fire an `onFallback` callback
3. The component starts a client-side timer-based simulation that mirrors the same 5-step progression with identical timing
4. The user experience is indistinguishable between real SSE and the fallback

**Design principle:** The interaction contract with the user is "you will see your pipeline progress through 5 steps." How that data arrives — SSE or local timer — is an implementation detail the user never needs to know about.

**Visual:** A split diagram — LEFT: SSE connection with server broadcasting events, RIGHT: client-side timer producing identical UI updates. Both paths converge to the same pipeline stepper visualization.

**Speaker notes:**
Enterprise environments are hostile to real-time connections. I designed the pipeline visualization to be source-agnostic — it looks and feels identical whether updates come from the server via SSE or from a client-side timer fallback. The transition between them is invisible. If SSE fails, the user never sees an error. They see the same pipeline, same animations, same timing. This was a deliberate design decision — reliability of the interaction experience matters more than technical purity of the data source.

---

## ACT 3: SYSTEMS AND POLISH

---

### Slide 15 — Design system: token architecture

**Title:** Tokens, not colors

**Content:**
The entire UI is built on a two-tier token system:

**Tier 1 — Semantic tokens** (CSS custom properties):
Every color is a named token tied to meaning: `--primary`, `--destructive`, `--success`, `--status-ready-bg`, `--status-failed-text`, etc. 50+ tokens per theme.

**Tier 2 — Tailwind bridge**:
Tokens map to Tailwind utilities (`bg-primary`, `text-destructive`, `border-border`), so components never reference hex values.

**Dark mode = token swap:**
The `.dark` class redefines every token. Components don't change — they reference the same tokens, which resolve to different values. Dark mode isn't an afterthought or an override layer; it's a parallel token set.

**Status color pairs:**
Each status (Ready, Processing, Failed, Warning) has independently tuned background + text pairs for both themes, maintaining WCAG contrast in each:

| Status | Light (bg / text) | Dark (bg / text) |
|--------|-------------------|-------------------|
| Ready | #DEF9F3 / #056764 | #0f3f36 / #99f6e4 |
| Processing | #EDF4FF / #0B5CAB | #132b54 / #bfdbfe |
| Failed | #FEF0F3 / #B60554 | #4c1d2f / #fda4c2 |

**Visual:** A token architecture diagram: CSS variables (Tier 1) → Tailwind config (Tier 2) → Component usage. Show one token (`--primary`) flowing from definition to `bg-primary` in a button.

**Speaker notes:**
I structured the design system as tokens, not colors. No component in the app references a hex value directly — everything goes through semantic tokens. This meant dark mode was not an exercise in "override every color" but rather "define a parallel set of tokens." The status colors were the hardest part — Ready, Processing, Failed each need to be distinct and legible in both themes, so I tuned each background/text pair independently for WCAG contrast rather than using a formula.

---

### Slide 16 — Dark mode as a first-class citizen

**Title:** Two themes, one interaction

**Content:**
Dark mode implementation:
- **Detection:** Checks `localStorage` first, then falls back to `prefers-color-scheme: dark` system preference
- **Toggle:** Sun/Moon icon swap in the Global Header, persisted to `localStorage`
- **Propagation:** `.dark` class on `<html>` activates Tailwind's `dark:` variant for every component automatically

**Challenges solved:**
- **Raster assets:** Data source card PNG icons use `dark:invert dark:brightness-200` for automatic adaptation without duplicate asset files
- **Status colors:** Each status has 4 custom values (light bg, light text, dark bg, dark text) — not derived from a single base color
- **Global header:** Uses a deep navy (`#001639` light, `#0a1020` dark) that maintains visual weight in both themes

**Visual:** Side-by-side screenshots of the Library View in light and dark mode, with 3-4 callouts highlighting specific tokens and their values in each theme.

**Speaker notes:**
Dark mode is often treated as a filter over the light theme. I treated it as a first-class design surface. The status colors aren't just lightened or darkened versions of the light theme — they're independently tuned pairs. For example, the "Ready" status uses a pale teal background with dark teal text in light mode, but a deep teal background with bright teal text in dark mode. Same meaning, different execution. Raster images were a pragmatic challenge — rather than creating duplicate PNG sets, I used CSS invert plus brightness adjustment, which gives a reasonable dark mode treatment at zero asset cost.

---

### Slide 17 — Micro-interaction inventory

**Title:** The details that add up

**Content:**
A catalog of small interactions that collectively create the feel of the product:

| Interaction | Duration | Easing | Detail |
|-------------|----------|--------|--------|
| Sidebar collapse/expand | 200ms | ease-out | Width animates between 64px and 180px; icons-only in collapsed state |
| Chevron rotation | 200ms | default | All collapsible triggers rotate 90 degrees |
| Collapsible open | 280ms | cubic-bezier(0, 0, 0.2, 1) | Height + opacity + translateY combined |
| Collapsible close | 220ms | cubic-bezier(0.4, 0, 1, 1) | Faster close than open — closing should feel responsive |
| Pulse ring | 2s | infinite | Teal glow radiating from active pipeline dot |
| Shimmer sweep | 3.5s | infinite linear | Gradient sweep across active step text |
| Connector fill | 700ms | cubic-bezier(0.22, 1, 0.36, 1) | Top-to-bottom fill of step connector |
| Drag-over feedback | Instant | — | Border + background color swap on drag enter |

**Design principle:** Asymmetric timing — opening animations are slightly slower than closing ones. Opening reveals content, so users need a beat to process the new information. Closing removes content, which users initiated intentionally, so it should feel snappy and obedient.

**Visual:** A grid of 4-6 short video loops, each showing one micro-interaction in isolation with its timing annotation.

**Speaker notes:**
I want to call out the asymmetric timing pattern. Collapsibles open in 280ms but close in 220ms — and they use different easing curves. Opening is slower with a deceleration curve because you're revealing new content and the user needs a moment to orient. Closing is faster with an acceleration curve because the user made a deliberate choice to dismiss, and the UI should feel responsive to that intent. This asymmetry applies throughout — it's a small thing individually, but it shapes the overall feel.

---

## ACT 4: OUTCOME AND REFLECTION

---

### Slide 18 — What shipped

**Title:** From prototype to handoff

**Content:**
- **Functional prototype:** ~4,100 lines of application code across 32 files — not a static mockup, a working app with real file upload, real-time pipeline visualization, and simulated AI recommendations
- **Used for:** Stakeholder alignment across PM, engineering, and design leadership. Eliminated ambiguity in the spec — instead of describing interactions, we demonstrated them.
- **Engineering handoff:** The prototype served as a living specification — engineers could inspect animations, timing curves, state transitions, and edge cases directly in the browser rather than interpreting static mockups
- **Design system contributions:** Status color tokens, pipeline animation patterns, and the collapsible card pattern were contributed back to the team's shared design system

**Visual:** A dashboard-style layout showing project metrics — 32 files, 14 UI primitives, 50+ design tokens, 5 pipeline states, 4 status themes, 3 fallback layers.

**Speaker notes:**
This prototype shipped as a design artifact, not a production feature — but it did the job of three traditional deliverables. It replaced static mockups for stakeholder reviews, because people could interact with the real pipeline. It replaced interaction specs for engineering, because they could inspect the actual animation values and state logic. And it contributed reusable patterns — the status tokens, pipeline stepper, and collapsible card — back to the team's design system.

---

### Slide 19 — What I'd iterate on

**Title:** Honest reflection

**Content:**
1. **Reduced motion support:** The current prototype doesn't honor `prefers-reduced-motion`. In production, all animations should have static fallbacks — the pulse ring becomes a static highlight, the shimmer becomes a plain "Processing..." label, connectors fill instantly.

2. **Responsive design:** The prototype is desktop-only with a fixed sidebar. For a shipped product, I'd design a mobile-appropriate layout — likely collapsing the sidebar into a hamburger menu and stacking the pipeline stepper horizontally.

3. **Accessibility audit:** While the prototype uses semantic HTML, ARIA labels, and keyboard-focusable controls, I'd want a full screen reader walkthrough of the pipeline progression. Live regions (`aria-live`) should announce step transitions for users who can't see the animations.

4. **Empty and error state depth:** The current error state on the pipeline is a single "Failed" status with a retry button. I'd design more specific error states — "File too large," "Unsupported format," "Index creation timed out" — each with a targeted recovery action.

**Visual:** A 2x2 grid with each reflection area as a card: Reduced Motion, Responsive, Accessibility, Error States. Each with a 1-line description of the gap and proposed solution.

**Speaker notes:**
I want to be transparent about what I'd improve. The biggest gap is reduced motion support — every animation I showed should degrade gracefully for users who've requested reduced motion. The pipeline pulse becomes a static indicator, the shimmer becomes plain text, connectors fill instantly. This is table stakes for production and I'd address it first. Accessibility-wise, the animations are inherently visual — I'd add `aria-live` regions so screen readers announce each step transition. And the error states need more specificity — "Failed" is not actionable. "File too large — try splitting into smaller documents" is.

---

### Slide 20 — Key takeaway

**Title:** Interaction design is trust design

**Content:**
The thread through this project:

> When users hand data to a system and wait, every moment of silence erodes trust. Interaction design for async processes isn't about decoration — it's about maintaining a conversation between the system and the user. The pipeline stepper says "I'm working on step 3." The file status says "I'm indexing your specific document." The fallback says "even if the connection drops, I'll keep you informed." Every animation, every state transition, every tooltip is an answer to an unasked question: **"Is this working?"**

**Core principles demonstrated:**
1. **Motion as communication** — animations convey state, not personality
2. **Context-aware behavior** — the UI adapts its behavior to what the user is experiencing (auto-collapse suppressed during processing)
3. **Graceful degradation** — the interaction contract is maintained regardless of technical conditions
4. **Explain, don't disable** — every disabled state has a reason; every wait has visible progress

**Visual:** Clean slide with the four principles as a vertical list, each with a single-line description.

**Speaker notes:**
If there's one idea I'd leave you with, it's that interaction design for async workflows is fundamentally about trust. Users are handing their data to a system and waiting. Every pulse ring, every file status update, every tooltip on a disabled button is the system saying "I see you, I'm working, here's what's happening." The alternative — a spinner and silence — is the system saying nothing. And silence, in enterprise tools, reads as failure. The craft of interaction design is making sure the system never goes quiet when the user is listening.

---

## APPENDIX

---

### Slide A1 — Technical implementation (if asked)

**Title:** How it's built

**Content:**

| Layer | Technology |
|-------|------------|
| Framework | React 18 (functional components, hooks) |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| UI primitives | shadcn/ui + Radix UI |
| Variants | class-variance-authority (CVA) |
| Icons | Lucide React + 12 custom SVG components |
| Real-time | Server-Sent Events (SSE) |
| Server | Express 5 (prototype backend) |
| Deployment | Vercel (serverless functions) |

**State architecture:** No state management library — state lives in the root component and flows via props. An optimistic update cache (`libraryOverrides`) merges local changes over server responses, ensuring the UI always reflects the latest user action even if the server response is stale.

**Triple-fallback API pattern:** Every API call tries: (1) server endpoint → (2) lightweight registration endpoint → (3) localStorage. The app works offline, which made it reliable for stakeholder demos.

**Visual:** Architecture diagram showing Client (React + Vite) ↔ Express Server ↔ JSON Store, with SSE as a side channel and the triple-fallback noted.

**Speaker notes:**
I'll keep the technical details brief unless you want to dig in. The key design-relevant technical decisions: SSE for real-time updates with automatic client-side fallback. A token-first CSS architecture that makes dark mode a variable swap rather than a rewrite. And a triple-fallback API pattern that means the prototype works reliably even without a server — critical for stakeholder demos where you don't control the network.

---

### Slide A2 — Pipeline state diagram (if asked)

**Title:** Pipeline state machine

**Content:**

```
For each of the 5 steps:

  ┌─────────┐    step started    ┌─────────────┐    step done    ┌─────────┐
  │ Default │ ─────────────────→ │ In-Progress │ ──────────────→ │  Ready  │
  └─────────┘                    └──────┬──────┘                 └─────────┘
                                        │
                                        │ error
                                        ▼
                                 ┌─────────────┐    retry
                                 │   Error     │ ──────────→ (restart step)
                                 └─────────────┘

For the overall pipeline:
  - Steps execute sequentially (step N+1 starts when step N reaches Ready)
  - Re-upload scenario: if infrastructure steps (2-4) are already Ready, they're skipped
  - SSE broadcasts every state transition to all connected clients
```

**Visual:** A formal state diagram as described above, with the 4 states as nodes and transitions as labeled arrows.

**Speaker notes:**
Each step is a simple state machine — default, in-progress, ready, or error. Steps run sequentially. The interesting edge case is re-upload: if a user adds more files to an existing library, the infrastructure steps that are already complete get skipped. The pipeline jumps from step 1 directly to step 5. This prevents unnecessary re-processing and the UI reflects it — those steps show as already complete from the start.
