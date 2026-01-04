# CLAUDE.md

> Instructions for Claude Code when working on this project.

## Project Overview

Sudoku Terminal is a React-based Sudoku game with a terminal/retro aesthetic. It uses Zustand for state management with localStorage persistence.

**Live Site**: https://sudoku.kahdev.me/  
**API Docs**: https://sudoku.kahdev.me/docs/

## Tech Stack

| Layer      | Technology       | Notes                                    |
|------------|------------------|------------------------------------------|
| UI         | React 19         | Functional components only               |
| Language   | TypeScript       | Strict mode enabled                      |
| Build      | Vite             | Dev server on port 5173                  |
| State      | Zustand          | Single store with persist middleware     |
| Icons      | Lucide React     | Icon library                             |
| Styling    | CSS Modules      | Scoped component styles                  |
| Puzzle Gen | `sudoku` (npm)   | External library for generation/solving  |
| Testing    | Vitest           | Use `-- --run` flag to avoid watch mode  |

## Commands

```bash
# Development
npm run dev              # Start dev server (accessible on local network)
npm run build            # TypeScript check + production build
npm run preview          # Preview production build

# Quality checks (run ALL before committing)
npm run typecheck        # TypeScript compiler check
npm run lint             # ESLint
npm run test -- --run    # Vitest (--run prevents watch mode)

# Documentation
npm run docs             # Generate TypeDoc API docs
npm run docs:watch       # Watch mode for docs

# Version management
./bump-version.sh        # Interactive version bump
```

## Development Workflow

### Making Changes

1. **Implement the change** with proper testing
2. **Bump version** before committing:
   ```bash
   ./bump-version.sh
   # Select: 1=patch, 2=minor, 3=major
   ```
3. **Run all checks** (mandatory):
   ```bash
   npm run typecheck
   npm run lint
   npm run test -- --run
   ```
4. **Commit** only after all checks pass:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```
5. **Push to deploy**:
   ```bash
   git push origin main
   ```

**Never commit without running all checks first.**

### Version Bump Guidelines

| Type  | When to Use                                      |
|-------|--------------------------------------------------|
| Patch | Bug fixes, linting fixes, small improvements     |
| Minor | New features, new components, enhancements       |
| Major | Breaking changes, major refactors                |

## Project Structure

```
src/
├── components/
│   ├── Controls/       # NumberPad (input, notes, undo/redo)
│   ├── Grid/           # Sudoku grid and cell rendering
│   ├── Layout/         # Main game layout orchestrator
│   └── UI/             # Settings, Victory modal, Pause overlay
├── hooks/
│   └── useKeyboard.ts  # Global keyboard event handler
├── store/
│   └── index.ts        # Zustand store (single source of truth)
├── styles/
│   ├── global.css      # CSS reset, variables, base styles
│   └── themes.css      # Theme-specific overrides
├── types/
│   └── index.ts        # TypeScript interfaces
├── utils/
│   ├── constants.ts    # Theme configs, difficulty settings
│   └── sudoku.ts       # Puzzle generation/validation
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

### Path Alias

Use `@/` for imports from `src/`:
```typescript
import { useStore } from '@/store';
import type { Cell } from '@/types';
```

## Architecture Principles

1. **Single source of truth**: All game state lives in the Zustand store (`src/store/index.ts`)
2. **Unidirectional data flow**: Store → Components → User Actions → Store
3. **Selective subscriptions**: Subscribe only to needed state slices to prevent re-renders
4. **Immutable updates**: Always clone grids before mutation

### Key Patterns

**Zustand selectors** (do this):
```typescript
const timer = useStore((state) => state.game.timer);
```

**Avoid subscribing to entire store**:
```typescript
// Bad: re-renders on ANY state change
const store = useStore();
```

**Grid cloning** (required for all mutations):
```typescript
const newGrid = cloneGrid(userGrid);
newGrid[row][col] = { ...newGrid[row][col], value: num };
```

## Code Style

### Formatting Rules

- **No emojis** in code, comments, or documentation
- **No hyphens** in prose where en-dashes or commas are appropriate
- Use straightforward, technical language
- Keep files under **200 lines** when possible
- Use functional components only (no class components)

### File Organization

- One component per file
- Co-locate CSS modules with components (`Component.tsx` + `Component.module.css`)
- Keep hooks in `src/hooks/`
- Keep utility functions in `src/utils/`

### TypeScript

- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use `type` imports: `import type { Cell } from '@/types'`

### CSS

- Use CSS Modules for component styles
- Use CSS custom properties (variables) for theming
- Mobile-first responsive design

## State Management Details

The store persists to localStorage under key `sudoku-storage`.

### Core Types

```typescript
interface Cell {
  value: number;      // 0 = empty, 1-9 = filled
  isGiven: boolean;   // true if part of original puzzle
  notes: number[];    // pencil marks
}

type Difficulty = 'easy' | 'medium' | 'hard';
type ThemeName = 'light' | 'dark' | 'green' | 'amber' | 'paper' | 'monochrome' | 'ocean' | 'clean';
```

### Storage Schema Version

When making breaking changes to state structure:
1. Increment `STORAGE_VERSION` in `src/store/index.ts`
2. Implement migration logic in the `migrate` function

## Testing

Tests use Vitest. Place test files adjacent to source files:
```
src/utils/sudoku.ts
src/utils/sudoku.test.ts
```

Run tests without watch mode:
```bash
npm run test -- --run
```

## Common Tasks

### Adding a New Theme

1. Add theme name to `ThemeName` type in `src/types/index.ts`
2. Add theme config to `THEMES` object in `src/utils/constants.ts`
3. Add any theme-specific CSS overrides in `src/styles/themes.css`

### Adding a New Setting

1. Add property to `GameplaySettings` interface in `src/types/index.ts`
2. Add default value in `defaultGameplaySettings` in `src/store/index.ts`
3. Add UI control in `SettingsPanel.tsx`

### Modifying the Grid

Always use the pattern:
1. Clone the grid with `cloneGrid()`
2. Make modifications to the clone
3. Update auto-notes if `autoNotes` setting is enabled
4. Push to history for undo/redo support
5. Check win condition if placing a number

## Deployment

- Automated via GitHub Actions on push to `main`
- Deploys to GitHub Pages
- VERSION file at root tracks current version
- GitHub Action creates release tags automatically

## Documentation

- **ARCHITECTURE.md**: Component hierarchy, data flow, state management diagrams
- **API Docs**: Generated by TypeDoc at https://sudoku.kahdev.me/docs/

## Troubleshooting

### localStorage Issues

If the app behaves unexpectedly after state changes:
1. Open browser DevTools
2. Clear `sudoku-storage` from localStorage
3. Refresh the page

### Type Errors After State Changes

After modifying state structure:
1. Update `STORAGE_VERSION`
2. Clear localStorage in browser
3. Run `npm run typecheck`