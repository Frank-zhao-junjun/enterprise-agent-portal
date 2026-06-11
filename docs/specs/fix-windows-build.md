# Spec: Fix Windows Build & Cross-Platform Scripts

## Objective

The project's `build`, `dev`, `start`, `prepare`, and `validate` scripts use `bash`, which is not available on Windows natively. This prevents development and deployment on Windows machines. We need to make all npm scripts cross-platform (Windows PowerShell + Linux/macOS bash).

**User:** Developer on Windows 10/11 using PowerShell
**Success:** `pnpm build`, `pnpm dev`, `pnpm start` all work on Windows without WSL/Git Bash

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | 5.x |
| Runtime | Node.js | 20+ |
| Package Manager | pnpm | (from lockfile) |
| Bundler (server) | tsup | (from deps) |
| Dev runner | tsx | (from deps) |

## Commands

```
Build:   pnpm build          # next build + tsup bundle
Dev:     pnpm dev            # tsx watch src/server.ts (port 5000)
Start:   pnpm start          # node dist/server.js (port 5000)
Lint:    pnpm lint           # eslint
TS Check: pnpm ts-check      # tsc -p tsconfig.json --noEmit
Validate: pnpm validate      # parallel ts-check + lint:build
```

## Current State (Problem)

All 5 scripts in `package.json` call `bash ./scripts/<name>.sh`:

| Script | bash Command | What It Does |
|--------|-------------|--------------|
| `build` | `bash ./scripts/build.sh` | pnpm install → next build → tsup src/server.ts |
| `dev` | `bash ./scripts/dev.sh` | kill port 5000 → tsx watch src/server.ts |
| `start` | `bash ./scripts/start.sh` | node dist/server.js on port 5000 |
| `prepare` | `bash ./scripts/prepare.sh` | pnpm install + optional coze check-bins |
| `validate` | `bash ./scripts/validate.sh` | pnpm validate |

Each bash script is a thin wrapper (10-30 lines) around standard pnpm/node commands.

## Target State (Fix)

Replace `bash ./scripts/<name>.sh` with direct commands in `package.json` that work cross-platform. Keep original `.sh` scripts for reference (or Linux deployment).

| Script | New Command |
|--------|------------|
| `build` | `pnpm install --prefer-frozen-lockfile && next build && tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify` |
| `dev` | `tsx watch src/server.ts` |
| `start` | `node dist/server.js` |
| `prebuild` | `pnpm install --prefer-frozen-lockfile` (extracted from build.sh) |
| `prepare` | `pnpm install --prefer-frozen-lockfile` (coze check-bins removed — not available on Windows) |
| `validate` | `pnpm run --parallel '/^(ts-check|lint:build)$/'` |

**Notes:**
- Port management (`kill_port_if_listening`) removed from `dev` — user manages port manually on Windows, or we add a `predev` script if needed
- `prepare.sh` had `coze check-bins --fix` which is Linux-specific; removed for now
- `COZE_WORKSPACE_PATH` env var handling: scripts already `cd` to workspace; pnpm handles cwd automatically
- Original `.sh` scripts kept in `scripts/` for reference (not deleted)

## Project Structure (unchanged)

```
scripts/          → Original bash scripts (kept for reference)
src/              → Application source
docs/specs/       → Specification documents (this file)
```

## Code Style

Follow existing patterns in `package.json`:
```json
{
  "scripts": {
    "ts-check": "tsc -p tsconfig.json",
    "validate": "pnpm run --parallel '/^(ts-check|lint:build)$/'"
  }
}
```
No new dependencies. Use `&&` for sequential commands, `&` for parallel (not used here). All commands must work in both PowerShell and bash.

## Testing Strategy

| Test | Command | Expected |
|------|---------|----------|
| TypeScript check | `pnpm ts-check` | ✅ No errors (already passing) |
| Lint | `pnpm lint` | Verify lint config works |
| Build (Next.js) | `pnpm exec next build` | ✅ Produces `.next/` |
| Server bundle | `pnpm exec tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify` | ✅ Produces `dist/server.js` |
| Full build | `pnpm build` | ✅ Completes without bash dependency |
| Dev server | `pnpm dev` (then Ctrl+C) | ✅ Starts on port 5000 |
| Production start | `pnpm start` | ✅ Runs `node dist/server.js` |

## Boundaries

- **Always do:** Run `pnpm ts-check` before committing; use `&&` for sequential commands; keep original `.sh` files
- **Ask first:** Adding new npm dependencies; changing port number; deleting any existing files
- **Never do:** Delete the `scripts/` directory; change `next.config.ts` or `tsconfig.json`; modify source code in `src/`

## Success Criteria

1. ✅ `pnpm build` completes on Windows PowerShell (no `bash` dependency)
2. ✅ `pnpm dev` starts the dev server on port 5000
3. ✅ `pnpm start` runs `node dist/server.js` on port 5000
4. ✅ `pnpm ts-check` still passes (no regressions)
5. ✅ `pnpm validate` still works (parallel lint + ts-check)
6. ✅ Original `.sh` scripts preserved in `scripts/`

## Open Questions

- ~~Should we keep the original `.sh` scripts?~~ → Yes, keep for reference/Linux deployment
- ~~Should we add a port-killing mechanism for Windows?~~ → No, user manages ports manually; use `npx kill-port 5000` if needed
