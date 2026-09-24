# ToolsBase

A Next.js application with free utilities for developers, creators, and everyday tasks. The interface uses a light, neutral theme with blue accents.

## Start locally

Use Node.js 22 LTS (or another version supported by the installed Next.js release) and npm.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. Existing installations can run `npm run dev` directly.

## Documentation

- [Design reference](docs/DESIGN.md): the single source for theme, typography, responsive layouts, navigation, and shared notices.

- [Maintenance and architecture guide](docs/MAINTENANCE.md): project structure, homepage design, footer, search, adding tools, environment configuration, SEO, verification, and troubleshooting.
- [Torrent and hashing guide](docs/TORRENT_TOOLS.md): instructions for all 15 tools, protocol details, supported formats, limits, test coverage, and extension points.
- [Verification record](docs/VERIFICATION.md): checks performed for the compact homepage, footer, and functional torrent tools.

## Commands

```sh
npm test              # Torrent, calculator, and validation tests
npm run typecheck     # TypeScript checks
npm run lint          # Repository-wide ESLint; older files have existing lint debt
npm run build         # Production build, including TypeScript validation
npm start             # Serve the completed production build
```

The torrent tools need no API keys. AI generators use the server-side `GROQ_API_KEY` (the existing `NEXT_GROQ_KEY` is also supported). The default Groq model is `openai/gpt-oss-20b`; set `GROQ_MODEL` to override it with a chat model available to your account. Analytics configuration is described in the maintenance guide. Never copy credentials into documentation or commit environment files.

## Page structure

Keep metadata in server route files. Use a single descriptive H1 per page and a logical H2/H3 hierarchy. The shared site header and footer belong to `app/layout.tsx`; tool pages should not duplicate them.
