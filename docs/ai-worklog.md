# AI worklog — AI-ify My Project

I built this with an AI coding agent (Claude Code), with Figma connected over MCP. I wrote the brief, which covers the product, the art direction, the growth loop, and what *not* to do. I directed every phase and reviewed the result in the browser at each step. The agent wrote most of the code and the Figma file. This log is what actually happened, including the parts that went wrong.

## Quick table — 3 examples

| # | What I asked the AI | What it produced | What I kept, changed or rejected — and why |
|---|---|---|---|
| 1 | “Design it in Figma first: tokens, wireframes, components, desktop, mobile, prototype. Then build it.” | A Figma file with 99 variables, 18 text styles, 22 components (including every state), 14 grayscale wireframes, a 1440 landing page, 4 mobile screens and an 8-screen clickable prototype. | **Kept, restructured.** My Figma Starter plan allows only 3 pages and one mode per variable collection, and the first script failed on both limits. Instead of dropping the structure, the 7 requested pages became named sections inside 3 pages, and Desktop/Mobile tokens became separate groups. The code mirrors those tokens 1:1. |
| 2 | “Generate an AI upgrade for any project idea, but it must work without an API key.” | A Claude call with structured JSON output, plus a 26-pattern fallback library. When nothing matched, the first version invented a generic “AI-Powered *X* Assistant”. | **Rejected the generic fallback for nonsense input.** Typing `asdf` returned “AI-Powered Asdf Assistant”, which is fake value. Now single unknown words get “That doesn’t look like a project yet — try ‘smart parking system’”. Model output is never rendered raw: every field is clipped, stripped of markdown, and the score is clamped. |
| 3 | “Test the whole growth loop like a real student would, on desktop and on a 375px phone.” | Browser QA found real bugs: on mobile both nav buttons showed (a Tailwind `hidden` vs `inline-flex` conflict), which widened the page to 510px. A `/r/CODE` invite recorded the source as “direct” instead of “referral”. Admin showed **800%** conversion. | **Fixed all three, and changed one rule.** The conversion bug came from counting simulated friends as visitors' registrations. It's now session-based. A friend registering from the same IP within 2 minutes was silently *held*; I kept that rule for production but chose to *hold for review, never block*, because a whole campus shares one Wi-Fi IP. |

## Longer, honest context

**What the AI was good at**
- Turning a long brief into a consistent system quickly. The design tokens, components and code all use the same names.
- Writing the same business rules once (`shared/domain.ts`) and running them both on the server and in the browser. The demo therefore still works if the backend is down.
- Catching its own mistakes, but only once it looked at the running product. Typechecks passed while the mobile layout was broken.

**Where I had to step in or decide**
- **Value before the form.** The AI-ify result comes *before* registration. Asking for details first would have been the default, but students need a reason to care before they register.
- **Accent restraint.** One highlighter colour, used on about 2% of the page. An early direction also highlighted the hero headline; I dropped it so the highlight means “this is the AI upgrade”.
- **Honest numbers.** The leaderboard's starting colleges are labelled sample data and can be switched off (`SEED_LEADERBOARD=false`). The growth plan marks cost-per-registration as an estimate to be validated by the paid test.
- **A debugging lesson.** For about an hour, my tests were hitting an old server process still running in the background, so “fixes” looked like they didn't work. The tell was a 413 error from code I had already changed. I now check which process owns the port before trusting a test.

**What the AI did not do**
- It did not run any real campaign, so no real students and no real A/B results. The three tests in the plan are designed and instrumented, not yet run.
- The live Claude generation was never called during the build (no API key was set). Every demo result comes from the pattern library. The integration typechecks against the SDK but is unverified live.
