# Hyperframes Composition Brief: CryptoBazaar

## Objective
A 25-second vertical launch brag for CryptoBazaar — India's gated P2P stablecoin exchange with smart-contract escrow.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: vertical — 1080×1920
- Duration: 25s

## Source Material
- Project root: `/home/agrim22/Desktop/cryptobazaar`
- Primary files read: `frontend/src/app/page.tsx`, `frontend/src/app/globals.css`, `frontend/package.json`, `CLAUDE.md`
- Product name: CryptoBazaar
- Tagline / strongest claim:
  - "THE secure / protected / trusted P2P BAZAAR"
  - "India's most rigorously vetted P2P exchange for USDT and USDC against INR."
  - "Every member verified. Every trade held in escrow."
- Key UI moments to recreate:
  - Hero rotator word (secure → protected → trusted) with blinking cursor
  - Lime accent on key terms
  - Multi-chain pills (USDT/USDC × Polygon/Solana/Tron)
  - Smart contract escrow stamp
  - Verification triad (Aadhaar + PAN + Liveness)
  - Lottery-style live stats counter
- Copy that must appear verbatim:
  - `THE [secure | protected | trusted] P2P BAZAAR`
  - `India's most rigorously vetted P2P exchange.`
  - `USDT & USDC. INR. Every trade in escrow.`
  - `SMART CONTRACT ESCROW`
  - `Crypto locks on-chain. We never touch it.`
  - `AADHAAR / PAN / LIVENESS`
  - `Locked in code. Not in our wallets.`
  - `CRYPTOBAZAAR.CO.IN`

## Creative Direction
- Tone preset: `cinematic` (anchor) with `app-store` restraint and one `chaotic` acceleration (chain pill cascade + verification stamps)
- Creative direction: "trader-terminal trailer — lime-on-black, Bebas Neue stabs, India context as emotional payoff"
- Interpretation: hold each claim long enough to read; use motion + cuts for pacing, never flashing text. Lime accents stab — they do not strobe.
- Angle: CryptoBazaar is an *anti-exchange*. The video should prove it: every claim is a stamp.
- Hook: 0–2.6s black cold open, "THE [secure|protected|trusted] P2P BAZAAR" with lime BAZAAR slam on the 1.60s music drop.
- Outro: "CRYPTOBAZAAR / Locked in code. Not in our wallets. / cryptobazaar.co.in" with lime underbar swipe.
- Avoid:
  - Generic SaaS language ("streamline", "empower", "platform")
  - Abstract filler (particles, generic city skylines, abstract waves)
  - Unrelated visual redesign — brand is lime #D4FF00 on black/white, Bebas Neue + Manrope

## Visual Identity
- Background: black `#000` for cinematic scenes; near-white `#FAFAFA` for the stats panel (matches the bone-card moments on the site)
- Text: white on black; black on light
- Accent: lime `#D4FF00`
- Display font: Bebas Neue (loaded via Google Fonts in the composition; producer canonicalizes)
- Body font: Manrope (loaded via Google Fonts)
- Visual references from the project: condensed all-caps headlines, lime accent stabs, pill chips with 999px radius, rolling tabular-num counters from the `LotteryCounter` component

## Storyboard
Full storyboard is the contract in `brag-output/brag-plan.md`.

Scene summary:
1. **Hook** — 2.6s — `THE [secure|protected|trusted] P2P BAZAAR` with lime BAZAAR slam on the 1.60s music cue
2. **Promise** — 3.2s — "India's most rigorously vetted P2P exchange" with lime underline sweep
3. **Multi-chain cascade** — 3.7s — 5 pills snap in per-beat: USDT × Polygon/Solana/Tron, USDC × Polygon/Solana
4. **Escrow** — 4.7s — Lock glyph + "SMART CONTRACT ESCROW / Crypto locks on-chain. We never touch it."
5. **Verification** — 4.2s — AADHAAR / PAN / LIVENESS stamps slam in, then "VERIFIED · EVERY TIME"
6. **Live stats** — 3.6s — Lottery-roll counters: verified members, trades, ₹ volume
7. **Outro** — 3.0s — CRYPTOBAZAAR wordmark + lime underbar + tag + URL

## Audio
- Audio role: cinematic bed with beat-locked reveals
- Audio arc: full level under hero → slight duck under copy-dense scenes 2/4 → full under final logo, ring-out 0.5s past final frame
- Music: `assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (114 BPM)
- Music treatment: full @ 0.85 volume; let it ring under the outro
- Music cue guidance: `assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.json` (bundled preset). Strong cues locked at 1.60s (hook), 3.70s (underline), 8.96s (chain row), 9.50s (escrow lock), 17.91s (verified settle), 22.65s (outro). Sequential beats used for pill cascade and stat counters (see `brag-plan.md`).
- Audio-reactive treatment: optional, subtle. Lime glow on hero BAZAAR may pulse with RMS during the hold. The escrow glow halo (s4-glow) is an obvious audio-reactive target if available. If extraction unavailable, skip — do not block render.
- Audio-coupled moments:
  - 1.55s — hero BAZAAR slam → soft impact
  - 6.34–8.44s — pill cascade → 5× soft UI ticks per pill
  - 9.50s — escrow lock click → 1× hard lock click
  - 14.76–15.81s — stamp lands → 3× impact hits
  - 18.96–21.07s — stat settles → 3× soft UI ticks
  - 22.65s — outro logo lock → 1× soft announcement chime
- SFX selection guidance: prefer the bundled `ui/`, `interface/`, and `impact/` sets. Avoid high high-frequency-risk files for the pill cascade (it repeats).
- SFX analysis guidance: see `~/.claude/skills/brag/assets/sfx/sfx-analysis.md` for risk scoring.
- Exact SFX choice: deferred to Hyperframes — pick after the animation is implemented and feels right.
- Audio files: music has been copied into `composition/assets/music/`. Hyperframes copies any SFX it selects into the same tree.

## Hyperframes Instructions
- Composition lives at `composition/index.html` (single-file portrait composition).
- All scenes use the `clip` class with `data-start` / `data-duration` / `data-track-index`.
- Track indices alternate (1, 2, 1, 2, …) so adjacent scenes never collide on the same track.
- GSAP timeline drives all motion; deterministic mulberry32 PRNG for the lottery roll.
- Lint passes with zero errors (4 warnings: Google Fonts external link, track density, two unresolved-selector GSAP overlap heuristics).
- Render via `npx hyperframes render --output ../brag.mp4 --fps 30 --quality standard`.
