# Submission — answers ready to paste

## 1. Growth Plan link
LIVE_URL/plan/Growth-Plan.pdf

6 slides covering the maths, the insight, the loop, channels and budget, the 7-day plan, and measurement with 3 tests. The same slides are live at `LIVE_URL/deck`. A PPTX is in the repo: [deliverables/Growth-Plan.pptx](../deliverables/Growth-Plan.pptx).

## 2. Working Asset link
LIVE_URL

The full working prototype:
- type a project → AI-upgraded blueprint → WhatsApp share card
- 30-second registration → referral link → 3-friend tracker → AI Builder Pack
- campus leaderboard
- growth dashboard (`/admin`, key `aiify-admin`)
- tracked campaign links and QR posters (`/qr`)
- the plan as a deck (`/deck`)

Add `?demo=1` for the presenter controls. Code: https://github.com/saijeevan06/ai-ify-my-project

## 3. Your 3 Tests

**Test 1 — Value first vs. form first (the core bet).** Hypothesis: letting students AI-ify their own project *before* asking them to register converts more visitors than a register-first page. Final-years in placement season respond to “here's a stronger version of the project you'll defend in interviews”, not to “learn AI in 60 minutes”, and seeing their own upgraded project gives them a reason to register. What I'd test: a 50/50 split of all traffic, with the current flow (AI-ify → blueprint → register) against a variant where the hero CTA is “Reserve my spot” and AI-ify unlocks after registering. Metric: registrations ÷ unique visitors. Guardrail: workshop show-up rate by variant, because a registration that doesn't show up isn't a win.

**Test 2 — Share card vs. plain link.** Hypothesis: sharing the visual blueprint card (their own project name and AI score, sized for WhatsApp) gets more friends to click than a bare referral link. It's personal and screenshot-worthy, and in a class group it reads as “look what I made”, not an ad. What I'd test: on the result and dashboard screens, variant A makes “Share card” the primary action; variant B makes “Copy link” primary. Metric: invite-link opens per sharer (`referral_link_opened` ÷ students who shared). Secondary: referral registrations per registrant (K).

**Test 3 — College rivalry vs. personal reward.** Hypothesis: a post-registration nudge framed as “Your college is #4 — 3 more builders to overtake #3” drives more sharing than “Refer 3 friends to unlock the AI Builder Pack”. Group identity spreads in class groups; an individual reward stays individual. What I'd test: the success-screen and Day-5 reminder message, split 50/50 by registrant. Metric: share rate (registrants who tap WhatsApp or copy their link ÷ registrants). Secondary: K and registrations per college.

All three are measurable with events the product already tracks: `page_view`, `project_generated`, `registration_started`, `registration_completed`, `whatsapp_clicked`, `referral_link_copied`, `referral_link_opened`, `referral_registered`. They aren't run yet, because there's no real traffic.

## 4. AI Worklog
https://github.com/saijeevan06/ai-ify-my-project/blob/main/docs/ai-worklog.md

## 5. 3-Minute Video
*Record it, then paste the Loom / Drive link here.* The script and step-by-step recording guide are in [docs/video-script.md](video-script.md).

## 6. What did AI suggest that you deliberately rejected, and why?

I ruled out the usual AI-generated look in the brief itself: no purple gradients, glowing orbs, robots, glassmorphism or “unlock the power of AI” copy. Instead it's an engineering-notebook style with a single highlighter colour. The rejections that mattered came during the build:

- **Fake value.** For input it couldn't recognise, the fallback generator invented a project anyway: typing “asdf” returned “AI-Powered Asdf Assistant”. I rejected that, so nonsense now gets “that doesn't look like a project yet”.
- **Blocking referrals.** The first anti-abuse rule would have blocked referrals from the same IP. I changed it to *hold for review* instead, because a whole campus shares one Wi-Fi IP, and blocking would punish exactly the students we want.
- **Flattering numbers.** The admin dashboard showed 800% conversion because simulated friends counted as visitors' registrations. I made conversion session-based, and the leaderboard's sample colleges are labelled as sample data and can be switched off.
