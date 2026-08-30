# LifeSavingsStep

A personal webapp for planning and tracking the money needed to live, year by
year — expected expenses rolled into a yearly timeline, with your own life
plans (buy a car, have a kid, retire, ...) layered on top to see how they
shift the numbers.

---

## 📊 Dashboard

| | |
|---|---|
| **Stage** | 🟢 Feature-complete shell — timeline, categories, events, income and balance projection all built; real numbers still to be entered |
| **Repo** | [github.com/tan-my/LifeSavingsStep](https://github.com/tan-my/LifeSavingsStep) (public) |
| **Deploy** | Vercel project connected/imported |
| **Stack** | Next.js + TypeScript → Vercel |
| **Storage** | Local-only (localStorage), export/import for backup |
| **Currency** | MYR (RM) |
| **Timeline range** | This year → age 100 |

### 💰 Current status: income & projects

*This is a personal snapshot, not part of the app's data model — just a place
to eyeball everything in one spot. Doesn't include LifeSavingsStep itself
(that's the tool, not a tracked project). Click a project to expand its
status.*

**Monthly income:** _TBD — fill in_

**Projects:** _TBD — fill in_

*(Project A = earns money · Project B = competition · Project C = new skill in progress)*

**Project A**
<details>
<summary><strong>[Project name]</strong> — status: 🟡 in progress</summary>

- Status:
- Income (est./month):
- Notes / next step:

</details>

**Project B**
<details>
<summary><strong>[Project name]</strong> — status: 🟡 in progress</summary>

- Status:
- Deadline:
- Notes / next step:

</details>

**Project C**
<details>
<summary><strong>[Project name]</strong> — status: 🟡 learning</summary>

- Status:
- Started:
- Notes / next step:

</details>

### Build progress

- [x] 1a. Scaffold Next.js + TypeScript project (local git initialized, Clean Executive Enterprise design system applied)
- [x] 1b. Create GitHub repo, push
- [x] 1c. Connect Vercel deploy
- [x] 2. Data model (categories, custom events, first-run birth year/age) + localStorage persistence + export/import
- [x] 3. Yearly timeline view + year-detail drill-down
- [x] 4. Category management UI
- [x] 5. Custom life-event UI
- [x] 6. Income tracking + running balance projection
- [x] 7. Life-event preset catalog — tick a common event and it lands on the timeline at its average price (`src/lib/eventPresets.ts`)
- [x] 8. Income projection — per-source yearly raises, gross/take-home basis, statutory deductions
- [x] 9. EPF modelled as a locked pot — contributions compound at the dividend rate and are released into spendable savings at the access age
- [ ] 10. Fill in real category data and life events (see "Numbers to fill in" below)

### 🚧 Blockers / open questions

- [ ] Real category numbers not yet researched (e.g. actual average utilities cost) — the seeded categories are all RM0 and the app is not useful until they're filled in
- [ ] The seeded **"Retirement / long-term savings contribution"** category now double-counts against modelled EPF. Leave it at RM0 unless it covers something EPF doesn't (PRS, ASB, a private pension)

### Key decisions

| Area | Decision |
|---|---|
| Platform | Build/run locally first; code on GitHub; deployed publicly to Vercel |
| Timeline | This year → age 100 (long-range life view) |
| Growth | Flat per-category by default; optional per-category yearly % growth |
| Scope | Single-user, no multi-profile/household support |
| Life events | Modeled as custom plans/events layered onto the baseline timeline |
| Income growth | Per-source yearly raise %, compounding from that source's own start year |
| Income basis | A profile-level gross/take-home switch, plus one "other deductions" % for tax, SOCSO and EIS |
| EPF | A pot held separately from spendable savings: contributions compound at an assumed dividend rate and are released in full at the access age (default 55). Balance and runway deliberately exclude it until then |
| Data storage | Local-only, no login/backend; numbers never leave the browser |
| Starting point | Birth year/age collected as a first-run setup field in-app |
| UI aesthetic | **Clean Executive Enterprise** — navy `#0F172A` + muted gold `#A16207` accent, light mode, Lexend (heading) + Source Sans 3 (body). Full tokens/components in `design-system/lifesavingsstep/MASTER.md` |

---

## Core idea

1. Define **expense categories** (utilities, food, housing, etc.).
2. For each category, enter **data** you've researched (e.g. "average
   utilities in my area = $X/month").
3. The app rolls categories up into a **yearly total** — a timeline view,
   one entry per year (this year → N years out).
4. Click a year → see the category breakdown for that year (what made up
   the total, and why).
5. Add **your own plans/events** on top of the baseline (a one-time cost, a
   new recurring expense starting a certain year, a raise, etc.) and see
   the adjusted yearly numbers.

## Planned features

- **Category management** — add/edit/remove expense categories, each with
  its own unit cost (monthly or yearly) and notes/source for the data.
- **Yearly timeline view** — a scrollable/clickable list or chart of years,
  each showing a total money-needed figure. Chart (bar/line, clickable per
  year) plus a list/table below it for precision.
- **Year detail view** — clicking a year expands into the category-by-category
  breakdown for that year.
- **Inflation / growth adjustment** — optionally apply a yearly % increase
  per category (e.g. healthcare rises faster than groceries) instead of a
  flat number every year.
- **Custom plans/events** — user-added one-off or recurring items tied to a
  specific year or age/life-stage (e.g. "wedding – 2027", "new baby –
  ongoing from 2029", "pay off car loan – ends 2031").
- **Notes per category/year** — freeform notes to record *why* a number is
  what it is, or decisions made.
- **Data persistence** — save everything locally (and/or export/import) so
  data isn't lost between sessions.

## Numbers to fill in

Everything the app needs a real figure for, in the order it's worth doing.
Reference ranges below are **rough averages to start from, not researched
pricing** — replace each one with your own number and record where it came
from in that item's notes field.

### 1. Profile — 3 numbers (`FirstRunSetup`, dashboard tile)

| Number | Notes |
|---|---|
| Birth year | Already collected at first run. Sets the age-100 end of the timeline. |
| Current savings | Spendable money only — cash, deposits, liquid investments. Leave EPF out; it has its own field. |
| Current EPF balance | From your i-Akaun. Held separately because it can't pay next year's bills. |
| Income basis | Gross or take-home — which one your income amounts are entered as. |
| Other deductions % | Income tax, SOCSO and EIS combined, as a % of gross. Excludes EPF. |
| EPF rates | Employee %, employer %, assumed dividend %, access age. Defaults 11 / 13 / 5.5 / 55. |
| Currency | Fixed at MYR, nothing to enter. |

### 2. Income — 6 fields per source (`/income`)

| Field | Notes |
|---|---|
| Amount | RM/month, or RM/hour if hourly. Gross or take-home according to the profile-level basis setting. |
| Hours per week | Hourly sources only. An hourly source with this blank contributes RM0. |
| Start year + month | When the job/contract started. |
| End year + month | Blank = ongoing. Set this to your retirement year to model income stopping. |
| Yearly raise % | Compounds from this source's own start year. 0 holds the rate flat forever, which understates lifetime income for most careers. |
| EPF applies | On for salaried employment, off for freelance, rental and dividends. |
| — | Also worth entering as separate sources: side income, freelance work, rental income, dividends, a spouse's income if you're planning jointly. |

### 3. Expense categories — 17 seeded, each needs an amount + growth rate (`/categories`)

Every seeded category is currently **RM0**. Each needs a base amount, a unit
(monthly/yearly), and optionally a yearly growth %.

**Essentials**

| Category | Reference range | What to check |
|---|---|---|
| Housing | Rent RM800–3,000/mo · mortgage ≈ RM2,200/mo on a RM500k loan @4%/35yr | Add condo maintenance + sinking fund (RM250–450/mo for ~1,000 sq ft), assessment tax and quit rent (RM300–1,800/yr), home insurance (RM300–800/yr) |
| Utilities | RM250–700/mo combined | TNB electricity RM100–350 (aircon-heavy homes go higher), water RM15–50, LPG ~RM26/tank, fibre internet RM89–199, mobile RM30–100/line |
| Groceries / food | Single RM600–1,200/mo · family of four RM1,200–2,500/mo | Split cooking-at-home vs eating out if you want the lever visible |
| Transportation | RM700–1,800/mo all-in | Car loan RM500–1,200, fuel RM200–500, tolls RM100–300, parking RM100–250, road tax RM90–380/yr, insurance RM800–2,500/yr, servicing RM600–1,500/yr |
| Healthcare | RM150–500/mo | Medical card premium (rises steeply with age), GP visits RM50–100, dental RM100–200 × 2/yr, optical RM300–800/yr, annual screening RM300–1,000 |
| Insurance | RM100–400/mo | Term life, critical illness, personal accident, income protection — only if not already inside Healthcare |

**Obligations**

| Category | Reference range | What to check |
|---|---|---|
| Debt repayment | Varies | PTPTN RM150–400/mo, credit cards, personal loans. Enter the real monthly instalment and set an end year via a life event if the loan finishes. |
| Taxes | Varies | Only relevant if not PCB-deducted (self-employed/freelance). Work out your effective rate from your chargeable income bracket. |
| Childcare / education | RM500–2,000/mo per child | Taska/nursery RM500–1,200, kindergarten RM300–800, tuition RM200–600. Private/international school belongs in life events instead — it has a defined start and end. |

**Lifestyle**

| Category | Reference range | What to check |
|---|---|---|
| Personal care | RM150–500/mo | Clothing, haircuts RM25–80, gym RM100–250, toiletries |
| Entertainment / subscriptions | RM200–800/mo | Streaming RM35–55, music ~RM17, dining out, hobbies |
| Travel / vacation | RM3,000–15,000/yr | Enter as yearly. One-off big trips are better as life events. |
| Gifts / donations | RM1,000–6,000/yr | Festive giving, weddings attended RM100–300 each, birthdays. Zakat/tithe is its own line if applicable. |

**Financial goals** — these are *outflows from spendable cash*, so only enter
them if the destination account isn't already inside `currentSavings`, or the
projection will double-count.

| Category | Reference range | What to check |
|---|---|---|
| Emergency fund contribution | Target 3–12 months of expenses | Enter the monthly contribution, not the target |
| Retirement / long-term savings | EPF is 11% employee + 12–13% employer | If your income figure is **net**, EPF is already deducted — don't enter it again here. PRS voluntary contributions (RM3,000/yr for tax relief) do belong here. |
| Other savings goals | Varies | House down payment fund, big purchase fund |

**Miscellaneous**

| Category | Reference range | What to check |
|---|---|---|
| Buffer / unplanned | 5–10% of the total above | The single most useful number here — most projections fail on the things nobody listed |

**Growth rates** — the app applies a per-category compounding % per year.
Headline inflation has historically sat around 2–3%, but medical
costs run far hotter (often quoted at 10%+ a year) and education runs above
general inflation too. Setting every category to 0% will make the later
decades of the timeline meaningfully too optimistic.

### 4. Life events — now a built-in catalog

All 60 common events now carry a real average, supplied by the user and stored
in `src/lib/eventPresets.ts` as a single `average` field (no low/typical/high
range). On `/events` → **Browse common events**, tick the ones that apply, set
the year, and they land on the timeline at that average with the assumption
behind it recorded in the note.

Groups covered: relationship & family, children & education, housing, vehicles,
career & education, health & family care, faith & festive, retirement & later
life, big purchases, and money coming in. The last group is stored as negative
amounts, so a bonus or a house sale reduces the money needed that year.

Recurring presets carry a `defaultYears` run-length where one makes sense —
childcare × 4, schooling × 11, tuition × 6, car loan × 9, baby essentials and
kindergarten × 3 — and the rest run open-ended to the end of the timeline.

- [ ] **`school-private` is the one figure still outstanding** — it sits at a
  placeholder RM35,000/year and its note says so. Every other preset is a
  supplied average.

### 5. Numbers the model can't hold yet

| Gap | Workaround today |
|---|---|
| Investment return on savings | The spendable balance doesn't compound — it's a straight sum of yearly nets. Only the EPF pot earns a return. |
| Loan modelling | No principal/rate/tenure → instalment calculator. Compute the monthly figure elsewhere and enter it. |
| Events tied to age | Events take a year, not an age. Convert manually (birth year + age). |
| Event inflation | Event amounts are flat — a wedding costed at today's price in 2040 is understated. |
| Progressive tax | "Other deductions" is one flat % of gross, so it doesn't rise as income grows. Revisit the figure if your salary changes a lot over the timeline. |
| Partial EPF withdrawals | The whole pot is released in one go at the access age. Account withdrawals before then (housing, education) aren't modelled — take them off the starting balance by hand. |

## Data model (as built — see src/lib/types.ts and calculations.ts for source of truth)

```
Category
- id
- name
- group (Essentials / Obligations / Lifestyle / Financial Goals / Misc)
- baseAmount (per month or per year)
- growthRatePerYear (optional %, default 0)
- notes / source (e.g. "based on 2026 city average")

CustomEvent
- id
- title
- startYear (+ optional endYear for recurring)
- amount (one-time total, or per-year if recurring; can be negative — an inflow)
- recurring (boolean)
- notes

IncomeSource
- id
- name
- rateUnit (monthly | hourly)
- amount (RM/month or RM/hour, gross or take-home per profile.incomeBasis)
- hoursPerWeek (only used when hourly, to derive a monthly equivalent)
- startYear + startMonth (+ optional endYear/endMonth — omitted = ongoing;
  a job/contract's period, prorated by month if it doesn't span a full year)
- growthRatePerYear (yearly raise %, compounding from this source's start year)
- epfApplies (whether statutory EPF accrues on this source)
- notes

EpfSettings (on UserProfile)
- enabled
- employeeRate (% of gross, comes out of take-home)
- employerRate (% of gross, paid on top — doesn't reduce take-home)
- dividendRate (assumed % per year)
- accessAge (age the pot is released, default 55)

UserProfile
- birthYear
- currency (MYR)
- currentSavings (spendable starting balance — excludes EPF)
- currentEpfBalance (locked starting pot)
- incomeBasis (gross | net)
- otherDeductionRate (% of gross for tax/SOCSO/EIS — excludes EPF)
- epf (EpfSettings)

YearPlan (derived, one per year, this year -> age 100)
- year, age
- categoryAmounts[], categoryTotal
- eventAmounts[], eventTotal
- totalForYear (categoryTotal + eventTotal — money needed that year)
- incomeAmounts[] (per source: gross, spendable, epfContribution)
- grossIncomeForYear, incomeForYear (spendable), epfContributionForYear
- netForYear (incomeForYear - totalForYear)
- balance (running SPENDABLE balance — excludes the EPF pot until release)
- epfBalance (locked pot after dividend + contributions; 0 once released)
- epfReleased (non-zero only in the access-age year)
- totalNetWorth (balance + epfBalance)
```

---

<details>
<summary><strong>📁 Reference: suggested starter categories</strong> (click to expand)</summary>

Feel free to trim, rename, merge, or split these once we start entering
real data.

**Essentials**
- Housing (rent/mortgage, property tax, home insurance)
- Utilities (electricity, water, gas, internet, phone)
- Groceries / food
- Transportation (car payment, fuel, public transit, maintenance, insurance)
- Healthcare (insurance premiums, out-of-pocket, dental, vision)
- Insurance (life, disability — if not already covered above)

**Obligations**
- Debt repayment (student loans, credit cards, personal loans)
- Taxes (if not auto-deducted / relevant for self-employed)
- Childcare / education (school fees, tuition, supplies)

**Lifestyle**
- Personal care (clothing, grooming, gym)
- Entertainment / subscriptions (streaming, hobbies, dining out)
- Travel / vacation
- Gifts / donations

**Financial goals**
- Emergency fund contribution
- Retirement / long-term savings contribution
- Other savings goals (house down payment, big purchase fund)

**Miscellaneous**
- Buffer / unplanned expenses (a catch-all %, e.g. 5–10% of total)

</details>

<details>
<summary><strong>🎉 Reference: suggested starter life events</strong> (click to expand)</summary>

These are custom plans/events you can adapt, remove, or add to once the app
exists. Each would be entered with a year (or age) and an estimated cost —
either one-time or the start of a new recurring expense.

**Relationship & family**
- Getting married (wedding cost — one-time)
- Having a child (one-time costs + ongoing childcare/education from that
  year onward)
- Moving in together / combining households

**Housing**
- Buying a house (down payment — one-time; mortgage — new recurring cost)
- Major renovation (one-time)
- Relocating to a new city (moving costs — one-time; possible new
  cost-of-living baseline)

**Career & education**
- Further education / certification (tuition — one-time or multi-year)
- Career break / sabbatical (temporary income gap, not an expense per se,
  but worth modeling)
- Starting a business (one-time capital + new ongoing costs)

**Vehicles & big purchases**
- Buying a car (one-time or loan → new recurring payment)
- Other major purchase (e.g. funding a hobby, home theater, etc.)

**Health & family care**
- Supporting aging parents (new recurring cost from a given year)
- Major medical event / procedure (one-time, or ongoing if it changes
  insurance needs)

**Retirement & later life**
- Retirement (income shifts from salary to savings/pension — marks a shift
  in the model, worth a dedicated milestone)
- Downsizing housing (potential one-time inflow + reduced recurring costs)

</details>
