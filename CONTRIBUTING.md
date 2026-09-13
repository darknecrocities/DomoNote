# Contributing to DomoNote

We welcome contributions to DomoNote. As an open-source, local-first project, we value code quality, privacy guarantees, clean architecture, and rigorous testing.

## Guidelines

1. Grayscale Visual Standard: All user interfaces must adhere to the black and white design system. Accent colors are reserved strictly for semantic feedback (recording active, connection status, errors). Emojis are strictly prohibited across all UI icons, components, and documentation.
2. Local-First Principle: Features must store their primary state in client-side IndexedDB. No feature may require remote cloud services by default.
3. No Simulated Data: Do not introduce mock data, fake statistics, or synthetic AI completions into production code paths.
4. Git Protocol:
   - Branch from main into feature/<name> or fix/<name>.
   - Write clear, imperative commit messages (no emojis).
   - Ensure `npm run test` and `npm run build` pass with zero warnings.
   - Open a Pull Request targeting main.

## Development Workflow

```bash
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote
npm install
npm run dev
```
