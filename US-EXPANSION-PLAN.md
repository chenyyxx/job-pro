# job-pro US Market Expansion Plan

> Created: 2026-06-02 · Last updated: 2026-06-03
> Status: Phase 1 IMPLEMENTED (14 companies wired, local commit). Phases 2–4 planned.

---

## Pipeline Architecture

```
cv-pro → job-pro → sponsor-check → final output
```

| Stage | Tool | Input | Output |
|-------|------|-------|--------|
| 1 | **cv-pro** | Raw resume (YAML/JSON) | Structured resume JSON |
| 2 | **job-pro** | Resume JSON + search params | Matched positions (JSON array) |
| 3 | **sponsor-check** | Positions JSON (stdin) | Enriched positions with sponsorship + layoff signals |

```bash
cv-pro get --variant=swe | job-pro find 'software engineer' --json | sponsor-check
```

---

## Phase 1: Greenhouse/Lever US Companies — ✅ DONE (2026-06-03)

**14 US Greenhouse companies wired and verified live.** Each is a ~16-line wrapper
calling `createAdapter` from `greenhouse.ts`, registered in `index.ts` (import +
COMPANIES + ADAPTERS). Company count: 50 → **64**. `tsc` clean, selftest passes,
cross-company `find` + apply-schema confirmed working.

| Company | key | slug | active jobs (probed 2026-06-03) |
|---------|-----|------|------|
| Anthropic | anthropic | anthropic | 367 |
| Stripe | stripe | stripe | 474 |
| Figma | figma | figma | 159 |
| Databricks | databricks | databricks | 752 |
| Cloudflare | cloudflare | cloudflare | 156 |
| Scale AI | scaleai | scaleai | 170 |
| Vercel | vercel | vercel | 74 |
| Airbnb | airbnb | airbnb | 232 |
| Discord | discord | discord | 70 |
| Anduril | anduril | andurilindustries | 1973 |
| Brex | brex | brex | 227 |
| Instacart | instacart | instacart | 135 |
| Pinterest | pinterest | pinterest | 178 |
| Lyft | lyft | lyft | 132 |

All are `multipart-anon` (apply without login). Family tag: `Greenhouse (US tech)`.

---

## Company-List Sourcing (how we find slugs + which adapter)

**The slug-resolution pipeline:** company name → guess-and-probe → if miss, scrape
careers page + regex the ATS URL → confirm with probe.

| ATS | Probe endpoint | Slug location |
|-----|---------------|---------------|
| Greenhouse | `boards-api.greenhouse.io/v1/boards/{slug}/jobs` | 1st path seg |
| Lever | `api.lever.co/v0/postings/{slug}?mode=json` | 1st path seg |
| Ashby | `POST api.ashbyhq.com/posting-api/job-board/{slug}` | 1st path seg |
| SmartRecruiters | `api.smartrecruiters.com/v1/companies/{slug}/postings` | 1st path seg |

**Best free seed: SimplifyJobs** (`SimplifyJobs/New-Grad-Positions` + `Summer202X-Internships`).
Auto-updated `listings.json` (~17k live postings). The `url` field exposes the ATS host +
slug directly — regex it to get a company→ATS→slug map for free, no probing. Also carries a
crowdsourced `sponsorship` field (`Offers Sponsorship` / `Does Not` / `Citizenship Required`).

**ATS distribution in SimplifyJobs (17,371 listings, probed 2026-06-03):**

| ATS | Listings | Adapter |
|-----|----------|---------|
| Workday | 7,488 (43%) | ❌ hard — biggest gap |
| Oracle Cloud | 2,314 | ❌ |
| Greenhouse | 1,380 | ✅ |
| SmartRecruiters | 759 | 🟡 Phase 2.5 |
| iCIMS | 696 | ❌ |
| Ashby | 537 | ✅ Phase 2 |
| Lever | 474 | ✅ |

**Rejected sources:** LinkedIn (no API, auth-walled, Easy-Apply hides the ATS, ToS/ban risk)
and levels.fyi (aggregator redirect hides slug). levels.fyi is noted below as a *comp-enrichment*
source, not a list source.

---

## Phase 2: Ashby Adapter

**Effort:** ~1 day · ~300-line factory + ~10 lines/company

```
POST https://api.ashbyhq.com/posting-api/job-board/{slug}        → job list
POST https://api.ashbyhq.com/posting-api/job-board/{slug}/job/{id} → detail
```

Targets: Linear, Retool, Supabase, Resend, Cal.com, Cursor, Perplexity, Dbt Labs, Railway.
**Likely also OpenAI, Notion, Ramp** (Phase-1 misses — see Open Questions; probably moved to Ashby).

Steps: build `cli/src/ashby.ts` factory (mirror `greenhouse.ts`) → map fields → wire
`fetchApplicationSchema` → add wrappers → register → selftest.

---

## Phase 2.5: SmartRecruiters Adapter

**Effort:** ~1 day · Covers Spotify, Visa, Bosch.
`api.smartrecruiters.com/v1/companies/{slug}/postings` (semi-public JSON).

---

## Phase 2.6: TikTok / ByteDance-international (Feishu Hire)

**Finding (2026-06-03):** `careers.tiktok.com` → redirects to **`lifeattiktok.com`**, an
**atsx-throne (Feishu Hire)** tenant — the *same platform* as `jobs.bytedance.com`, which
job-pro already supports via `bytedance.ts`. So a TikTok adapter is a near-clone of
`bytedance.ts` with a different host + `website-path` + portal values.

**Blocker:** the international tenant's public host fronts the API via Next.js
(`POST /api/v1/search/job/posts` → 405, `GET` → 200 empty). The exact host/headers/portal
params must be captured from one live XHR (browser network tab / Playwright). Once captured:
`cp bytedance.ts → tiktok.ts`, swap constants, register — ~30 min.

---

## Phase 3: Workday Adapter (Deferred)

**Effort:** 3-5 days · **43% of SimplifyJobs listings** (biggest gap, hardest).
`POST {tenant}.wd5.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs` — structured payload,
per-tenant variation, anti-bot. Covers Google/Meta/Amazon/Salesforce. Defer unless needed.

---

## Phase 4: US Resume Tailoring

**Effort:** Half day. In `extractResumeSignals()`: add US cities (SF/NYC/Seattle/Austin/LA/Remote),
English tech keywords (distributed systems, ML, full stack, CI/CD), adjust scoring for English JDs.

---

## sponsor-check (Separate Repo)

**Purpose:** PERM + layoff enrichment post-processor (stdin positions → enriched JSON).

### Prior art (GitHub survey 2026-06-03)
| Tool | Does | Gap |
|------|------|-----|
| `aryaminus/h1b-job-search-mcp` | DOL **LCA** download/cache/company-stats MCP | **LCA not PERM**; no trend signal; Python |
| `acforrester/PERM_data` | R scripts cleaning PERM FY2000–2024 | data-clean only, no lookup CLI |
| h1bgrader.com / h1bdata.info | web UIs over DOL | no clean API |
| Apify visa-sponsor-tracker | hosted H-1B+E-3+PERM API | paid, hosted |

**No existing tool does the PERM volume-trend signal** (the freeze indicator). sponsor-check is
not redundant. Borrow `aryaminus`'s download/cache pattern but point it at PERM, not LCA.

### Data sources
| Source | Status |
|--------|--------|
| DOL PERM Disclosure XLSX | ✅ proven (~92K rows/quarter, 155 cols) |
| layoffs.fyi (Airtable) | ⚠️ scrapable but "too hacky" — fallback only |
| WARN Act filings | 🔍 cleaner layoff alternative, TBD |

### Key design insight
**Filing volume + trend is the primary signal, NOT approval rate** (approval rate has
survivorship bias — only measures cases that survived pre-filing LMT/recruitment).

### Phases
1. PERM parser + CLI (`sponsor-check lookup amazon`) — borrow aryaminus fetch/cache pattern
2. Stdin enrichment mode (pipe from job-pro)
3. Layoff data integration (WARN Act preferred; layoffs.fyi fallback)
4. Caching + incremental refresh

---

## Open Questions

- [ ] **Phase-1 slug misses — resolve (likely Ashby):** OpenAI, Notion, Ramp, Rippling, Plaid
      (no Greenhouse board found 2026-06-03). OpenAI/Notion/Ramp strongly suspected on Ashby → Phase 2.
- [ ] **Coinbase** (`coinbase` GH slug) and **Netflix** (`netflix` Lever slug): boards respond 200
      but **0 active jobs** — verify correct slug or whether they moved off (Netflix → Workday). Not wired.
- [ ] TikTok adapter blocked on one captured live XHR from lifeattiktok.com (see Phase 2.6).
- [ ] Workday: worth the maintenance burden given it's 43% of listings?
- [ ] sponsor-check language: TypeScript (match job-pro) vs Python (proven XLSX parsing)?
- [ ] Layoff data source: WARN Act vs GitHub datasets vs layoffs.fyi hack?
- [ ] levels.fyi as a future **comp-enrichment** signal (cross PERM `WAGE_OFFER_FROM` with market comp) — not a list source.
- [ ] Publish fork to npm, or keep local-only?
