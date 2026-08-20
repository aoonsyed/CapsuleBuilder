# Capsule Builder

AI-assisted product and capsule planning tool for [Form Department](https://formdepartment.com). Designers and brand founders walk through a guided intake, answer clarifying questions, and receive structured recommendations—materials, color direction, design framework, cost estimates, complementary capsule pieces, and (on higher plans) market analysis.

The app is a React SPA embedded in the Form Department Shopify experience. Production access is gated by a Shopify `customer_id` and subscription status from the Capsule Builder backend.

## Features

- **Guided intake** — Line strategy, inspiration, and product focus (vision, brand cues, product type, features, price, materials, manufacturing prefs)
- **AI clarifying questionnaire** — Dynamic follow-up questions tailored to the user’s answers
- **Capsule results** — Product breakdown, complementary pieces, costs, and related design guidance (OpenAI via `/api/openai`)
- **Image generation** — Optional concept imagery via `/api/generateImage`
- **Market & financials** — Tier 2–gated market analysis with EmailJS team handoff / scheduling
- **Subscription-aware UI** — Trial banner, plan checks (`tier1` / `tier2` / admin), upgrade links to Form Department plans
- **Admin dashboard** — `/admin` view for users, trials, and subscriptions
- **Session persistence** — Questionnaire and results cached per run in local storage

## Tech stack

| Layer | Choices |
| --- | --- |
| UI | React 19, React Router 7, Tailwind CSS, Framer Motion, Sonner, react-icons |
| State | Redux Toolkit |
| AI | OpenAI (chat + images) through Vercel-style serverless routes in `api/` |
| PDF / mail | jsPDF + jspdf-autotable, EmailJS |
| Hosting | Create React App (`react-scripts`), typically deployed on Vercel |
| Auth / billing | Shopify customer ID + backend at `backend-capsule-builder.onrender.com` |

## App flow

Primary entry is `/` (or `/capsule-builder`), orchestrated by `CapsuleBuilderFlow`:

1. **Landing** — Brand overview and entry into the form grid (`LandingPage2`)
2. **Line strategy** — Brand / idea (`Step1Vision`)
3. **Inspiration** — Preference and reference cues (`Step2Inspiration`)
4. **Product focus** — Type, features, price, materials (`Step3ProductFocus`)
5. **Questionnaire** — AI-generated clarifying questions (`Questionnaire`)
6. **Results** — Structured capsule output (`Step4Suggestions`)
7. **Market analysis** — Financial / market sections when plan allows (`Step4bMarketFinancials`)

On localhost, customer validation is skipped and a trial state is emulated so the UI can be developed without Shopify.

## Routes

| Path | Description |
| --- | --- |
| `/`, `/capsule-builder` | Full multi-step builder |
| `/landing` | Standalone landing that continues into the builder |
| `/admin` | Admin dashboard (token-gated) |

## Project structure

```
api/                  # Serverless handlers (OpenAI chat + image generation)
public/               # Static assets and CRA public files
src/
  components/         # Steps, landing, admin, chrome, parsers
  utils/              # Auth helpers, local capsule storage
  formSlice.js        # Redux form state
  store.js
  index.js            # Router + Redux provider
```

## Getting started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install & run

```bash
npm install
npm start
```

App runs at [http://localhost:3000](http://localhost:3000). Localhost bypasses Shopify customer validation.

### Scripts

| Command | Description |
| --- | --- |
| `npm start` | Dev server |
| `npm run build` | Production build → `build/` |
| `npm test` | CRA test runner |

## Environment variables

Create a `.env` in the project root (never commit secrets). CRA only exposes variables prefixed with `REACT_APP_` to the client.

### Client (`REACT_APP_*`)

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_KEY` | Client/API key usage where configured |
| `REACT_APP_ADMIN_DASHBOARD_TOKEN` | Token for admin dashboard access |
| `REACT_APP_SCHEDULING_URL` | Booking / scheduling link override |
| `REACT_APP_TEAM_RECEIVER_EMAIL` | Team inbox for EmailJS handoff |
| `REACT_APP_EMAILJS_SERVICE_ID` | EmailJS service |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | EmailJS template |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `REACT_APP_BYPASS_MARKET_ANALYSIS_ACCESS` | Dev-only: skip market-analysis plan check (`true`). Do not enable in production |

### Server (API routes)

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI auth for `api/openai.js` and `api/generateImage.js` |

Configure these in your host (e.g. Vercel project settings) for production.

## Backend & auth

Production expects a 13-digit Shopify `customer_id` (or `logged_in_customer_id`) in the query string. The flow calls:

- `GET …/proxy/tool?logged_in_customer_id=…` — access, plan, trial, admin flags
- `GET …/proxy/validate-submission?…` — submission limits
- `GET …/proxy/check-page-access?…&page=market-analysis` — market analysis gating

Users without a valid customer ID are sent to Form Department login. Plan upgrades point at Form Department subscription pages.

## Notes

- Brand storefront: [formdepartment.com](https://formdepartment.com)
- Capsule Builder is private (`"private": true` in `package.json`); it is not published as an npm package
- Prefer editing the live flow under `src/components/CapsuleBuilderFlow.jsx` and `src/index.js`; older `src/App.js` is not the active entry point
