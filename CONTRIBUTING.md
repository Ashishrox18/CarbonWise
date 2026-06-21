# Contributing to CarbonWise

Thank you for your interest in contributing! This document explains how to get involved.

---

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. **Install dependencies**: `npm install`
3. **Copy environment config**: `cp .env.local.example .env.local` and fill in your API keys.
4. **Start the dev server**: `npm run dev`

---

## Development Workflow

### Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<description>` | `feat/weekly-goal-nudge` |
| Bug fix | `fix/<description>` | `fix/streak-off-by-one` |
| Documentation | `docs/<description>` | `docs/api-reference` |
| Refactor | `refactor/<description>` | `refactor/storage-layer` |
| Chore | `chore/<description>` | `chore/upgrade-next` |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add weekly CO₂ comparison widget
fix: correct streak calculation for timezone edge case
docs: update architecture diagram
chore: upgrade framer-motion to v12
```

---

## Quality Checklist

Before opening a PR, make sure all of these pass locally:

```bash
npm run typecheck   # TypeScript — zero errors
npm run lint        # ESLint — zero warnings
npm test            # Jest unit tests — all passing
npm run build       # Production build — zero errors
```

---

## Pull Request Process

1. Open a PR against the `main` branch.
2. Fill in the [PR template](.github/pull_request_template.md).
3. The CI pipeline must pass (type check + lint + unit tests + build).
4. At least one reviewer approval is required before merging.
5. Squash-merge is preferred to keep `main` history clean.

---

## Project Structure

```
app/          Next.js App Router pages and API routes
components/   React components (features/ and ui/)
hooks/        Custom React hooks
lib/          Pure business logic (no React dependencies)
services/     Server-side AI service wrappers
store/        Zustand global state
types/        TypeScript domain types
__tests__/    Jest unit tests
e2e/          Playwright end-to-end tests
docs/         Extended documentation
```

See [`docs/architecture.md`](docs/architecture.md) for a full explanation of each layer.

---

## Adding a New Feature

1. **Types first** — add or update types in `types/index.ts`.
2. **Pure logic** — implement business logic in `lib/` with unit tests.
3. **Service layer** — if AI/API calls are needed, add to `services/`.
4. **Hook** — expose logic to React via a custom hook in `hooks/`.
5. **Component** — build the UI in `components/features/` using primitives from `components/ui/`.
6. **Route** — wire up any new page in `app/`.

---

## Testing Requirements

- All new `lib/` and `services/` functions must have unit tests in `__tests__/`.
- Target **≥ 80% line coverage** for new files.
- UI-critical flows should have Playwright coverage in `e2e/`.

---

## Reporting Bugs

Use the [Bug Report issue template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS version
- Console errors or screenshots if applicable

---

## Suggesting Features

Use the [Feature Request issue template](.github/ISSUE_TEMPLATE/feature_request.md). Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

---

## Questions?

Open a [GitHub Discussion](https://github.com/Ashishrox18/CarbonWise/discussions) for questions that aren't bugs or feature requests.
