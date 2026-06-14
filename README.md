# Project YOU — A Darkroom for Your Mind

A knowledge management and visualization platform that helps you capture, organize, and explore your ideas through interactive graph visualization. Powered by AI-driven search and intuitive semantic organization.

## Features

- **Graph Visualization** - Explore your ideas as an interactive network graph with thousands of connected nodes
- **AI-Powered Search** - Natural language search across your entire knowledge base using Claude AI
- **Smart Collections** - Automatically organize and group related ideas
- **Multi-Format Support** - Capture knowledge from notes, URLs, PDFs, and voice
- **Real-time Filtering** - Filter by type, tags, and date range
- **Dark Mode UI** - Sleek, modern interface optimized for focus and creativity

## Tech Stack

- **Frontend**: Next.js 16 (App Router) with React 19.2
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Better Auth for user management and sessions
- **AI**: Vercel AI SDK with OpenAI/Claude models via AI Gateway
- **Visualization**: React Three Fiber for 3D graph rendering
- **Bundler**: Turbopack (Next.js default)

## Prerequisites

- Node.js 18+ (we recommend 20+)
- pnpm (recommended) or npm/yarn
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kaun-neel/Project-YOU.git
cd Project-YOU
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-here

# Optional: AI Gateway (if not using default Vercel AI Gateway)
# AI_GATEWAY_API_KEY=your-api-key-here
```

#### Getting Your Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or use existing
3. Copy the connection string under "Connection string"
4. Set it as `DATABASE_URL` in `.env.local`

#### Generating BETTER_AUTH_SECRET

Generate a secure random key:
```bash
openssl rand -base64 32
```

Copy the output and set it as `BETTER_AUTH_SECRET` in `.env.local`

### 4. Initialize the Database

```bash
pnpm db:push
```

This will create all necessary tables using Drizzle ORM.

### 5. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically reload when you make changes.

## Project Structure

```
project-root/
├── app/
│   ├── api/              # API routes (search, auth, etc.)
│   ├── (auth)/           # Auth pages (signin, signup)
│   ├── graph/            # Graph visualization page
│   ├── search/           # AI search page
│   ├── collections/      # Collections browser page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Entry point / landing
│   └── globals.css       # Global styles & design tokens
├── components/           # Reusable React components
│   ├── graph-view.tsx    # Graph visualization component
│   ├── search-view.tsx   # AI search interface
│   ├── top-nav.tsx       # Floating navigation bar
│   ├── app-shell.tsx     # Main app shell wrapper
│   └── ...
├── lib/
│   ├── db.ts            # Database client (Drizzle)
│   ├── auth.ts          # Better Auth configuration
│   ├── utils.ts         # Utility functions
│   └── ...
├── public/              # Static assets
├── package.json         # Dependencies & scripts
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── README.md            # This file
```

## Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run TypeScript type checking
pnpm type-check

# Format code with Prettier (if configured)
pnpm format

# Push database schema changes
pnpm db:push

# Generate types from database schema
pnpm db:generate

# Open database studio (Drizzle Kit)
pnpm db:studio
```

## Key Features Explained

### Graph View
Visualize your entire knowledge base as an interactive 3D graph. Each node represents an idea, and connections show relationships. Click and drag to explore, zoom to focus.

**Controls:**
- **Click** - Select/explore a node
- **Drag** - Rotate the graph
- **Scroll** - Zoom in/out
- **Sidebar Toggle** - Hide/show the filter panel with retractable button

### Search
Use natural language to search across your knowledge base. AI understands context and semantic meaning, not just keyword matching.

Type your question and get instant results with source citations.

### Collections
Organize related ideas into smart collections. Automatically group similar concepts or create custom collections manually.

### Filters
On the graph page, use the left sidebar to:
- Filter by content type (Note, URL, PDF, Voice)
- Filter by tags
- Select date ranges
- See statistics on your knowledge base

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Create a new project and connect your GitHub repository
4. Add environment variables in the project settings
5. Deploy!

```bash
# Or deploy directly via Vercel CLI
vercel deploy
```

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- AWS (EC2, ECS, Lambda with Vercel Serverless Adapter)
- Google Cloud
- Azure
- DigitalOcean
- Heroku
- Self-hosted servers

Ensure your hosting platform supports:
- Node.js 18+
- PostgreSQL database connection
- Environment variable configuration

## Development Tips

### Hot Module Replacement (HMR)
Changes to React components and CSS are reflected instantly without full page reload.

### Database Debugging
View and edit your database directly:
```bash
pnpm db:studio
```

Opens Drizzle Studio in your browser.

### TypeScript
The project is fully typed. Run type checking:
```bash
pnpm type-check
```

### Debugging
Use `console.log` for quick debugging. For production-safe debugging, use the `[v0]` prefix:
```typescript
console.log("[v0] Debug message:", variable)
```

## Troubleshooting

### "Cannot reach the AI"
- Check that you have internet connectivity
- Verify `DATABASE_URL` is correctly set
- For custom AI Gateway, ensure `AI_GATEWAY_API_KEY` is set in `.env.local`
- Check Vercel AI Gateway status at [status.vercel.com](https://status.vercel.com)

### Database Connection Error
- Verify `DATABASE_URL` format: `postgresql://user:password@host/database`
- Ensure the Neon database is running (check Neon console)
- Try reconnecting: `pnpm db:push`

### Blank Screen / App Not Loading
- Check browser console for errors (F12 → Console tab)
- Check terminal for build/compilation errors
- Clear browser cache: Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)
- Restart dev server: Stop with Ctrl+C, then `pnpm dev`

### Turbopack Build Issues
- Clear Turbopack cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Ensure only one version of Next.js: `pnpm why next`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test
3. Commit with clear messages: `git commit -m "feat: add new feature"`
4. Push to your fork
5. Open a Pull Request

## Architecture Notes

### State Management
- Server state: React Server Components (RSC)
- Client state: React hooks + SWR for data fetching
- Session state: Better Auth with secure cookies

### Database Schema
Uses Drizzle ORM for type-safe database operations. Schema is auto-generated and tracked in migrations.

### Authentication
- Email + password with bcrypt hashing
- Session-based authentication via Better Auth
- Automatic session refresh and CSRF protection

### API Routes
- `/api/search` - AI-powered search endpoint
- `/api/auth/*` - Better Auth routes (auto-generated)
- Additional routes for capturing and organizing knowledge

## Performance

- **Lighthouse Score Target**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **LCP (Largest Contentful Paint)**: < 2.5s
- **INP (Interaction to Next Paint)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1

The app uses:
- Code splitting for fast initial load
- Image optimization via Next.js `Image` component
- CSS-in-JS with Tailwind for minimal bundle size
- Server-side rendering where appropriate

## License

[Add your license here - e.g., MIT, Apache 2.0, etc.]

## Support & Questions

For issues, questions, or feature requests:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Join our community discussions

## Roadmap

- [ ] Collaborative mode for shared knowledge bases
- [ ] Mobile app (React Native)
- [ ] Advanced AI features (auto-summarization, anomaly detection)
- [ ] Plugin system for custom integrations
- [ ] Export to various formats (PDF, JSON, Obsidian vault)
- [ ] Real-time sync across devices

---

**Happy thinking!** 🧠

Start capturing, exploring, and organizing your knowledge today.
