# AI-ify My Project — Art Direction & Design Spec

Figma (source of truth for visuals): https://www.figma.com/design/1DORgjlaJYdR3O2jvZZI5V

## Concept — "Margin notes"

ENGINEERING NOTEBOOK × DIGITAL PRODUCT × AI WORKSHOP.
The student's own project is the hero visual. Nothing glows. The page behaves like
an engineer's working sheet: a faint drafting grid, mono annotations in the margins,
print crop-marks on the important cards, and one highlighter colour used the way a
student actually uses a highlighter — sparingly, on the thing that matters.

### Three signature devices (recognisable without the logo)

1. **The diff.** Transformation is shown as a version bump, the way engineers already
   read change: `− Smart attendance system  v1.0` → `+ AI-Powered Attendance Intelligence  v2.0-ai`.
   A gutter with − / + markers, line numbers, and the new title swiped with highlighter.
2. **Highlighter swipe.** `#D7FF4F` appears as a slightly skewed marker band *behind*
   ink text (never as gradient text, never as a glow). It marks: the AI result title,
   the primary CTA's arrow key, progress fills, the selected state, your college row.
3. **Crop marks + mono labels.** Key surfaces (hero input, result blueprint, share card)
   carry 12px print registration corners and `[01] / LABEL` annotations in Geist Mono.

### What we refuse
Purple/blue gradients, glow blobs, brains, robots, particles, glassmorphism, gradient
text, pill-everything, three-cards-under-a-centred-hero, typing effects, "unlock the power".

## Tokens

### Colour (ratio ≈ 70 neutral / 20 secondary neutral / 8 dark / 2 accent)
| Token | Value | Use |
|---|---|---|
| `color/background` | `#F4F1EA` | paper |
| `color/surface` | `#FFFFFF` | cards, inputs |
| `color/surface-sunken` | `#ECE8DE` | wells, track of progress bars |
| `color/text-primary` | `#111111` | ink |
| `color/text-secondary` | `#4B4A45` | body copy |
| `color/text-muted` | `#6B6862` | meta (refined from #77746D → passes 4.5:1 on paper) |
| `color/border` | `#D8D4CA` | 1px hairlines |
| `color/border-strong` | `#111111` | focused / selected outlines |
| `color/accent` | `#D7FF4F` | highlighter (never text on paper) |
| `color/accent-ink` | `#111111` | text on accent |
| `color/dark` | `#161616` | workshop + share card surface |
| `color/dark-text` | `#F4F1EA` | text on dark |
| `color/dark-muted` | `#9A978F` | meta on dark |
| `color/success` | `#4D8C5A` | |
| `color/warning` | `#C88A28` | |
| `color/error` | `#B94A48` | |

### Typography — one superfamily
- **Geist** (UI, body, display). **Geist Mono** for labels/annotations/numbers only
  (same family; reads as the "engineering" voice).

| Style | Desktop | Mobile | Weight | Tracking |
|---|---|---|---|---|
| Display | 80 / 0.92 | 48 / 0.95 | 600 | −0.05em |
| H1 | 56 / 1.0 | 40 / 1.0 | 600 | −0.035em |
| H2 | 42 / 1.05 | 32 / 1.08 | 600 | −0.025em |
| H3 | 28 / 1.15 | 24 / 1.2 | 500 | −0.02em |
| Body L | 20 / 1.5 | 18 / 1.5 | 400 | 0 |
| Body | 16 / 1.55 | 16 / 1.55 | 400 | 0 |
| Small | 14 / 1.4 | 14 / 1.4 | 400 | 0 |
| Micro | 12 / 1.3 | 12 / 1.3 | 400 | 0 |
| Label (Mono, UPPER) | 12 / 1.3 | 11 / 1.3 | 500 | +0.02em |

### Spacing (8px base)
`4 8 12 16 24 32 40 48 64 80 96 120 144 160`. Sections: desktop 144 (120 min), mobile 80.

### Grid
Max 1280. 12 cols, 24 gap. Padding: desktop 48 / tablet 32 / mobile 20 / small 16.

### Radius
sm 8 · md 12 · lg 16 · hero/result 20 · button 10 · pill only on tags/status.

### Elevation
- `shadow/key` — `0 2px 0 0 #111111` (primary button, hero input: a keycap edge, not a float)
- `shadow/sm` — `0 1px 2px rgba(17,17,17,.06)`
- Otherwise 1px borders. No large blurred shadows.

### Texture
Drafting grid: 1px lines every 24px, ink at 3% opacity. Paper grain: none (grid is enough).

### Motion
| Token | Value |
|---|---|
| `motion/fast` | 180ms |
| `motion/normal` | 300ms |
| `motion/emphasis` | 500ms |
| `motion/transform` | 800ms |
| easing | `cubic-bezier(0.22, 1, 0.36, 1)` |

Hierarchy: hero transformation = strong; product interaction = strong; sections = 12px
rise + fade once; text = none; footer = none. `prefers-reduced-motion`: translate/scale
removed, opacity fades kept at `fast`.

### Breakpoints
360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920.

## Signature interaction — AI-ify
1. INPUT — card with crop marks, `[01] / YOUR PROJECT`.
2. ANALYZING — label switches to `[02] / READING YOUR PROJECT`, 1px progress line runs
   along the card's bottom edge; keywords in the input get underlined one by one.
3. TRANSFORMING — the input line becomes the `−` line of a diff; `+` line slides in below.
4. RESULT — the card expands into the Blueprint; upgrade rows stagger in (60ms), the
   title gets its highlighter swipe (scaleX 0→1, 500ms), score counts up.

## Mobile (390)
Designed separately: input is a full-width 64px-tall field with a 56px CTA beneath,
suggestions scroll horizontally, blueprint becomes a vertical stack with sticky section
labels, referral tracker becomes a sticky mini-bar on the dashboard, sticky bottom CTA
appears after the hero leaves the viewport.
