# Premium V2 Plan

## Summary

Archive note: this plan predates the clean launch. New production deploys must use Cloudflare Pages project `gyn-clinical` and domain `https://gyn-clinical.pages.dev`.

Goal: turn GYNA into a premium clinical PWA that is trusted, readable, fast, iPhone-first, and guarded by automated checks before deploy.

Premium means:

- Clinical structure: every disease, medication, and questionnaire has sources, review status, next steps, limitations, and patient-safe wording.
- Design maturity: one calm medical design system, one typography scale, one component language, and no conflicting legacy visual rules.
- Mobile quality: iPhone SE is the constraint; iPhone 13 and iPhone 15 Pro Max must scale up without overflow, overlap, or broken touch flows.
- Release discipline: typecheck, tests, content audit, production build, iPhone audit, and deploy verification are required before Cloudflare release.

## Implementation Tracks

1. Content contract and trust
   - Add stable `sourceQuality`, `redFlags`, and `patientExplanation` fields to diseases.
   - Keep enriched fallbacks safe and clearly mark source-specific claims that still need review.
   - Keep medication and questionnaire enrichment at 100% runtime coverage.
   - Expand strict content audit so release checks fail when required premium fields are missing.

2. Premium design system
   - Centralize tokens in the premium layer: color, typography, spacing, radii, shadows, safe-area, and motion.
   - Use reusable primitives for premium cards, badges, clinical panels, source badges, and risk flags.
   - Reduce decorative glass where it hurts readability; reserve visual effects for shell-level atmosphere.

3. Clinical command center UX
   - Make the home screen a dashboard: section routes, quick tools, recent items, favorite count, review status, and PWA trust signals.
   - Upgrade catalog cards with clinical badges, risk/source metadata, reviewed date, compact summary, and a clear primary action.
   - Upgrade disease modal into a clinical cockpit with quick summary, red flags, diagnosis, management, patient explanation, and source quality.

4. iPhone-first mobile PWA
   - Treat mobile sheets as native-feeling full-height panels with sticky headers and reliable close behavior.
   - Keep touch targets at least 44px, tabs/chips at least 38px, and all screens safe-area aware.
   - Ensure bottom navigation is the primary mobile route layer and top navigation does not crowd the viewport.

5. Performance and release
   - Lazy-load heavy sections only when opened.
   - Reduce decorative motion on mobile and for `prefers-reduced-motion`.
   - Keep production preview and iPhone visual audit as mandatory pre-deploy gates.

## QA Gates

- `npm run typecheck`
- `npm run test:run`
- `npm run audit:content -- --strict`
- `npm run build`
- `npm run preview -- --host 127.0.0.1 --port 4173`
- `npm run audit:iphone`
- `npm run audit:a11y`
- `npm run deploy:production`
- `npx wrangler pages deployment list --project-name gyn-clinical`

## Acceptance Criteria

- All runtime diseases have guideline basis, review status, source quality, red flags, diagnostic criteria, differential diagnosis, management algorithm, follow-up triggers, clinical summary, and patient explanation.
- All medications and questionnaires pass strict premium coverage.
- Home, catalog, disease modal, questionnaires, and pharmacology work without horizontal overflow on iPhone SE, iPhone 13, and iPhone 15 Pro Max.
- UI uses one premium language for buttons, cards, badges, panels, modal sheets, and empty/error states.
- Production build succeeds and Cloudflare deployment is verified before release is considered complete.
