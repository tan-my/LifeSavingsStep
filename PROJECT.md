# LifeSavingsStep

A personal webapp for planning and tracking the money needed to live, year by
year — expected expenses rolled into a yearly timeline, with your own life
plans (buy a car, have a kid, retire, ...) layered on top to see how they
shift the numbers.

---

## 📊 Dashboard

| | |
|---|---|
| **Stage** | 🛠️ Scaffolded — Next.js app running locally, no features built yet |
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
- [ ] 5. Custom life-event UI
- [ ] 6. Fill in real category data and life events

### 🚧 Blockers / open questions

- [ ] Real category numbers not yet researched (e.g. actual average utilities cost in Malaysia) — placeholders OK for now, needs real data before the tool is useful

### Key decisions

| Area | Decision |
|---|---|
| Platform | Build/run locally first; code on GitHub; deployed publicly to Vercel |
| Timeline | This year → age 100 (long-range life view) |
| Growth | Flat per-category by default; optional per-category yearly % growth |
| Scope | Single-user, no multi-profile/household support |
| Life events | Modeled as custom plans/events layered onto the baseline timeline |
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

## Data model (draft, subject to change)

```
Category
- id
- name
- group (Essentials / Obligations / Lifestyle / Financial Goals / Misc)
- baseAmount (per month or per year)
- growthRatePerYear (optional %, default 0)
- notes / source (e.g. "based on 2026 city average")

YearPlan (derived + overrides)
- year
- categoryAmounts[] (calculated from Category, or overridden manually for that year)
- customEvents[] (see below)
- totalForYear (calculated)

CustomEvent
- id
- title
- year (or startYear + endYear for recurring)
- amount (one-time or per-year)
- recurring (boolean)
- notes
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
