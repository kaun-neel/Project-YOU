# Project YOU

> A darkroom for your mind — a personal knowledge OS / "second brain".

Project YOU lets you capture **notes, URLs, PDFs, and voice memos**, turns them into nodes
in an interactive **knowledge graph**, groups them into **collections**, and lets you
**chat with an AI** that answers grounded only in what you've saved.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**,
**D3** (force-directed graph), **Three.js / React Three Fiber** (shader backgrounds), and
**Framer Motion**. Authentication is stored in **AWS DynamoDB**; AI answers stream from the
**Vercel AI Gateway**.

---

## Prerequisites

- **Node.js 20+** (Node 18.18+ minimum for Next.js 16)
- **pnpm** (recommended — the repo ships a `pnpm-lock.yaml`)

  ```bash
  npm install -g pnpm
  ```

> You can use `npm` or `yarn` instead, but `pnpm` matches the committed lockfile.

---

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment variables

Create a `.env.local` file in the project root. All variables are read at runtime by the
API routes under `app/api/`.

```bash
# ── Session / Auth (lib/session.ts) ─────────────────────────────
# Secret used to sign JWT session cookies. Use a long random string (32+ chars).
SESSION_SECRET="replace-with-a-long-random-secret-string"

# ── AWS DynamoDB (lib/db-auth.ts) ───────────────────────────────
# Required for sign up / sign in to work.
DYNAMODB_TABLE_NAME="project-you-users"
AWS_REGION="us-east-1"
AWS_ROLE_ARN="arn:aws:iam::<account-id>:role/<role-name>"

# ── AI Search (app/api/search/route.ts) ─────────────────────────
# Token for the Vercel AI Gateway (https://ai-gateway.vercel.sh).
OPENAI_API_KEY="your-ai-gateway-or-openai-key"
```

### Notes on environment variables

| Variable | Used by | Required for |
|----------|---------|--------------|
| `SESSION_SECRET` | `lib/session.ts` | Signing session cookies. A dev fallback exists, but **always set this** in any real deployment. |
| `DYNAMODB_TABLE_NAME` | `lib/db-auth.ts` | Storing/reading users. |
| `AWS_REGION` | `lib/db-auth.ts` | DynamoDB client region. |
| `AWS_ROLE_ARN` | `lib/db-auth.ts` | Vercel OIDC credential provider for AWS access. |
| `OPENAI_API_KEY` | `app/api/search/route.ts` | AI chat/search responses. |

> **Don't have AWS / AI keys yet?** The UI still runs without them — the graph, collections,
> and capture modal use in-memory seed data from `lib/mock-data.ts`. Only **sign in/sign up**
> (DynamoDB) and **AI search** (AI Gateway) require live credentials.

### DynamoDB table shape

`lib/db-auth.ts` uses a single-table design with a composite primary key:

- **Partition key (`PK`)** — string
- **Sort key (`SK`)** — string

Records written:

- User profile: `PK = USER#<id>`, `SK = PROFILE`
- Email lookup: `PK = EMAIL#<email>`, `SK = LOOKUP`

Create a table with `PK` (hash) and `SK` (range) string keys before signing up.

## 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The page auto-reloads as you edit files. Start with `app/page.tsx`.

---

## Available scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the local dev server at `http://localhost:3000`. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Run the production build locally (run `pnpm build` first). |
| `pnpm lint` | Run ESLint. |

---

## Project structure

```text
app/
  api/
    auth/{signup,signin,signout,me}/  # JWT auth endpoints (DynamoDB-backed)
    fetch-url/                        # Scrapes OpenGraph metadata from a URL
    search/                           # Streams AI answers via the AI Gateway
  collections/                        # Collections page
  search/                             # AI search page
  layout.tsx, page.tsx, globals.css   # Root layout, stage router, global styles
components/
  knowledge-graph.tsx                 # D3 force-directed graph
  capture-modal.tsx                   # Note / URL / PDF / Voice capture
  graph-view.tsx, collections-view.tsx, search-view.tsx
  sign-in-page.tsx, entry-experience.tsx, settings-panel.tsx, top-nav.tsx
  ui/                                 # Shaders & primitives (plasma, wave-text, button)
lib/
  db-auth.ts                          # DynamoDB user storage + bcrypt
  session.ts                          # JWT session cookies (jose)
  auth-types.ts, mock-data.ts, utils.ts
public/                               # Logo & hero assets
DESIGN.md                             # Visual design system reference
```

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn, `tw-animate-css`
- **Graph / 3D:** D3, Three.js, @react-three/fiber
- **Animation:** Framer Motion
- **Auth:** jose (JWT), bcryptjs, AWS DynamoDB via @aws-sdk
- **AI:** Vercel AI Gateway (`gpt-4o-mini`)
- **Analytics:** @vercel/analytics (production only)

---

## Deployment

The project is configured for **Vercel** (uses `@vercel/functions` OIDC for AWS access and
`@vercel/analytics`). Set the same environment variables listed above in your Vercel project
settings, then deploy. Every merge to `main` deploys automatically when linked to v0/Vercel.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [v0 Documentation](https://v0.app/docs)
