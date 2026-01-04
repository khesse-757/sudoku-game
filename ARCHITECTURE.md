# Sudoku Terminal — Architecture Documentation
 
> **Last Updated**: December 2025 

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [User Interaction Flow](#user-interaction-flow)
- [Theming System](#theming-system)
- [Key Patterns](#key-patterns)

---

## Overview

Sudoku Terminal is a React-based Sudoku game with a terminal/retro aesthetic. The application uses a unidirectional data flow pattern with Zustand for state management and CSS Modules for scoped styling.

### Core Principles

- **Single source of truth**: All game state lives in one Zustand store
- **Unidirectional data flow**: Store → Components → User Actions → Store
- **Persistence**: Game progress and settings auto-save to localStorage
- **Responsive**: Separate layouts for mobile and desktop

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI** | React 19 | Component framework |
| **Language** | TypeScript | Type safety |
| **Build** | Vite | Fast dev server and bundling |
| **State** | Zustand | Lightweight state management |
| **Icons** | Lucide React | Icon library |
| **Styling** | CSS Modules | Scoped component styles |
| **Puzzle Gen** | `sudoku-core` | Logic-based puzzle generation (no guessing) |

---

## Puzzle Generation

Puzzles are generated using [sudoku-core](https://github.com/komeilmehranfar/sudoku-core), which guarantees all puzzles are solvable using logic techniques (no guessing/backtracking required).

### Difficulty Levels

Difficulty is determined by which solving strategies are required:

| Level | Strategies Required | Hints Allowed |
|-------|---------------------|---------------|
| Easy | Single Remaining Cell, Single Candidate Cell | 5 |
| Medium | + Single Candidate Value, basic elimination | 3 |
| Hard | + Pointing Elimination, advanced techniques | 0 |

The package uses a scoring system based on strategy frequency and complexity. Higher difficulties require more advanced techniques applied more often.

### Generation Flow

```mermaid
flowchart LR
    generate["generate(difficulty)"] --> board["81-element array<br/>(1-9 or null)"]
    board --> solve["solve(board)"]
    solve --> solution["Complete solution"]
    board --> convert1["boardToGrid()"]
    solution --> convert2["boardToGrid()"]
    convert1 --> puzzle["puzzle: number[][]"]
    convert2 --> sol["solution: number[][]"]
```

---

## Project Structure

```
src/
├── components/
│   ├── Controls/
│   │   ├── NumberPad.tsx          # Number input, notes toggle, undo/redo
│   │   └── NumberPad.module.css
│   ├── Grid/
│   │   ├── Grid.tsx               # 9×9 grid container with responsive sizing
│   │   ├── Grid.module.css
│   │   ├── Cell.tsx               # Individual cell with highlighting logic
│   │   └── Cell.module.css
│   ├── Layout/
│   │   ├── GameLayout.tsx         # Main orchestrator component
│   │   └── GameLayout.module.css
│   └── UI/
│       ├── VictoryModal.tsx       # Win screen overlay
│       ├── PauseOverlay.tsx       # Pause screen overlay
│       ├── SettingsPanel.tsx      # Slide-out settings/menu panel
│       ├── SettingsButton.tsx     # Hamburger menu trigger
│       └── *.module.css
├── hooks/
│   └── useKeyboard.ts             # Global keyboard event handler
├── store/
│   └── index.ts                   # Zustand store (single file)
├── styles/
│   ├── global.css                 # CSS reset, variables, base styles
│   └── themes.css                 # Theme-specific overrides
├── types/
│   └── index.ts                   # TypeScript interfaces
├── utils/
│   ├── constants.ts               # Theme configs, difficulty settings
│   └── sudoku.ts                  # Puzzle generation/validation
├── App.tsx                        # Root component
├── main.tsx                       # React entry point
└── index.css                      # CSS imports
```

---

## Component Hierarchy

```mermaid
graph TD
    subgraph Entry
        main[main.tsx]
        App[App.tsx]
    end

    subgraph Layout
        GL[GameLayout]
    end

    subgraph Overlays
        VM[VictoryModal]
        PO[PauseOverlay]
        SP[SettingsPanel]
    end

    subgraph GameArea
        Grid[Grid]
        Cell[Cell ×81]
    end

    subgraph Controls
        NP[NumberPad]
        SB[SettingsButton]
    end

    subgraph Hooks
        UK[useKeyboard]
    end

    main --> App
    App --> GL
    
    GL --> VM
    GL --> PO
    GL --> SP
    GL --> SB
    GL --> Grid
    GL --> NP
    GL -.->|uses| UK
    
    Grid --> Cell

    style GL fill:#e1f5fe
    style Grid fill:#fff3e0
    style Cell fill:#fff3e0
    style NP fill:#f3e5f5
    style VM fill:#ffebee
    style PO fill:#ffebee
    style SP fill:#ffebee
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **GameLayout** | Orchestrates everything: theme application, timer interval, layout switching (mobile/desktop), composes all child components |
| **Grid** | Renders 9×9 grid, handles responsive sizing via ResizeObserver |
| **Cell** | Renders single cell, computes highlighting states, displays value or notes |
| **NumberPad** | Number buttons (1-9), notes toggle, erase, undo/redo, reset |
| **SettingsPanel** | Full menu: new game, difficulty, gameplay options, themes, stats, hints, check/reveal |
| **VictoryModal** | Displays on win: time, mistakes, replay/new game options |
| **PauseOverlay** | Displays when paused: hides grid, shows resume button |
| **SettingsButton** | Hamburger menu icon to open SettingsPanel |

---

## State Management

### Store Structure

The application uses a single Zustand store with the `persist` middleware for localStorage persistence.

```mermaid
graph TB
    subgraph Store["Zustand Store"]
        subgraph GameState["game: GameState"]
            puzzle[puzzle: number 9×9]
            solution[solution: number 9×9]
            userGrid[userGrid: Cell 9×9]
            selectedCell[selectedCell: tuple or null]
            difficulty[difficulty: easy/medium/hard]
            timer[timer: number]
            isPaused[isPaused: boolean]
            isComplete[isComplete: boolean]
            mistakes[mistakes: number]
            hints[hintsRemaining: number]
        end
        
        subgraph SettingsState["settings: SettingsState"]
            theme[theme: ThemeName]
            font[font: FontFamily]
            gameplay[gameplay: GameplaySettings]
        end
        
        subgraph StatsState["stats: Statistics"]
            gamesCompleted[gamesCompleted: number]
            bestTimes[bestTimes: Record]
            totalPlayTime[totalPlayTime: number]
        end
        
        subgraph History["Undo/Redo History"]
            history[history: Cell grid array]
            historyIndex[historyIndex: number]
        end
    end
    
    subgraph Persistence["localStorage"]
        storage[(sudoku-storage)]
    end
    
    Store <-->|persist middleware| storage
```

### Type Definitions

```typescript
interface Cell {
  value: number;              // 0 = empty, 1-9 = filled
  isGiven: boolean;           // true if part of original puzzle
  manualNotes: number[];      // manual pencil marks (passive layer)
  autoNotes: number[];        // auto-calculated candidates (reactive layer)
  userEditedInAuto: number[]; // tracks manual edits in auto mode
}

type Difficulty = 'easy' | 'medium' | 'hard';
type ThemeName = 'light' | 'dark' | 'green' | 'amber' | 'paper' | 'monochrome' | 'ocean' | 'clean';

interface GameplaySettings {
  autoCheckMistakes: boolean;   // Highlight wrong numbers
  highlightConflicts: boolean;  // Show conflicting cells
  highlightRowColumn: boolean;  // Highlight selected row/column
  highlightBox: boolean;        // Highlight 3×3 box
  highlightIdentical: boolean;  // Highlight same numbers
  showTimer: boolean;           // Display timer
  showMistakes: boolean;        // Display mistake counter
  autoNotes: boolean;           // Auto-calculate pencil marks
}
```

### Dual-Layer Notes System

The game maintains two independent candidate layers:
- **Manual notes** (`manualNotes`): Passive scratchpad with no algorithmic intervention
- **Auto notes** (`autoNotes`): Reactive layer that auto-prunes when pen values are placed

User edits made in auto mode are tracked in `userEditedInAuto` and protected from auto-pruning.

### Store Actions

```mermaid
graph LR
    subgraph GameActions["Game Actions"]
        startNewGame
        selectCell
        setNumber
        clearCell
        toggleNote
        useHint
    end
    
    subgraph TimerActions["Timer Actions"]
        incrementTimer
        pauseGame
        resumeGame
    end
    
    subgraph CheckActions["Check/Reveal"]
        checkCell
        checkPuzzle
        revealCell
        revealPuzzle
        resetPuzzle
    end
    
    subgraph HistoryActions["History"]
        undo
        redo
        canUndo
        canRedo
    end
    
    subgraph SettingsActions["Settings"]
        setTheme
        setGameplaySetting
        resetStats
    end
    
    subgraph Helpers["Helpers"]
        getConflicts
    end
```

---

## Data Flow

### Unidirectional Flow Pattern

```mermaid
flowchart LR
    subgraph Store["Zustand Store"]
        State[(State)]
        Actions[Actions]
    end
    
    subgraph Components
        GL[GameLayout]
        Grid[Grid/Cell]
        NP[NumberPad]
        SP[SettingsPanel]
    end
    
    subgraph UserInput["User Input"]
        Click[Mouse/Touch]
        Keyboard[Keyboard]
    end
    
    State -->|subscribe| GL
    State -->|subscribe| Grid
    State -->|subscribe| NP
    State -->|subscribe| SP
    
    Click -->|onClick| NP
    Click -->|onClick| Grid
    Click -->|onClick| SP
    Keyboard -->|useKeyboard| Actions
    
    NP -->|call| Actions
    Grid -->|selectCell| Actions
    SP -->|call| Actions
    
    Actions -->|update| State
```

### Component → Store Subscriptions

Each component subscribes to specific slices of state using Zustand's selector pattern:

```mermaid
graph TD
    Store[(Zustand Store)]
    
    subgraph GameLayout
        GL_theme[settings.theme]
        GL_font[settings.font]
        GL_timer[game.timer]
        GL_paused[game.isPaused]
        GL_difficulty[game.difficulty]
        GL_mistakes[game.mistakes]
        GL_gameplay[settings.gameplay]
    end
    
    subgraph Grid
        G_userGrid[game.userGrid]
        G_selected[game.selectedCell]
    end
    
    subgraph Cell
        C_userGrid[game.userGrid]
        C_selected[game.selectedCell]
        C_solution[game.solution]
        C_gameplay[settings.gameplay]
        C_conflicts[getConflicts]
    end
    
    subgraph NumberPad
        NP_selected[game.selectedCell]
        NP_paused[game.isPaused]
        NP_complete[game.isComplete]
        NP_canUndo[canUndo]
        NP_canRedo[canRedo]
        NP_autoNotes[settings.gameplay.autoNotes]
    end
    
    Store --> GameLayout
    Store --> Grid
    Store --> Cell
    Store --> NumberPad
```

---

## User Interaction Flow

### Number Entry Flow

```mermaid
sequenceDiagram
    participant User
    participant NumberPad
    participant useKeyboard
    participant Store
    participant Cell
    
    alt Click/Tap
        User->>NumberPad: Click number button
        NumberPad->>Store: setNumber(n) or toggleNote(n)
    else Keyboard
        User->>useKeyboard: Press 1-9
        useKeyboard->>Store: setNumber(n) or toggleNote(n)
    end
    
    Store->>Store: Clone grid, update cell
    Store->>Store: Check for conflicts
    Store->>Store: Update auto-notes (if enabled)
    Store->>Store: Check win condition
    Store->>Store: Push to history
    Store->>Cell: State update triggers re-render
    Cell->>User: Display new value
```

### Cell Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant Cell
    participant useKeyboard
    participant Store
    participant Grid
    
    alt Click/Tap
        User->>Cell: Click cell
        Cell->>Store: selectCell(row, col)
    else Arrow Keys
        User->>useKeyboard: Arrow key press
        useKeyboard->>Store: selectCell(newRow, newCol)
    end
    
    Store->>Store: Update selectedCell
    Store->>Grid: State change
    Grid->>Cell: Re-render all cells
    Cell->>Cell: Compute highlighting
    Note over Cell: isSelected, isHighlighted,<br/>isIdentical, hasConflict
```

### Game Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Loading: App mounts
    Loading --> Playing: startNewGame() or<br/>restore from localStorage
    
    Playing --> Paused: pauseGame()
    Paused --> Playing: resumeGame()
    
    Playing --> Victory: checkWin() === true
    Victory --> Playing: startNewGame() or resetPuzzle()
    
    Playing --> Playing: setNumber()<br/>clearCell()<br/>useHint()
```

---

## Theming System

### Theme Architecture

Themes are applied via CSS custom properties, set dynamically by GameLayout.

```mermaid
flowchart TD
    subgraph Constants["utils/constants.ts"]
        THEMES[THEMES object<br/>8 theme configs]
    end
    
    subgraph Store
        theme[settings.theme]
    end
    
    subgraph GameLayout["GameLayout.tsx"]
        useEffect[useEffect hook]
    end
    
    subgraph DOM
        root[:root CSS variables]
        body[body.theme-*]
    end
    
    subgraph Components
        cells[All components]
    end
    
    theme -->|subscribe| GameLayout
    THEMES -->|lookup| GameLayout
    GameLayout -->|useEffect| useEffect
    useEffect -->|setProperty| root
    useEffect -->|className| body
    root -->|CSS vars| cells
```

### CSS Variable Flow

```typescript
// GameLayout.tsx applies theme on change
useEffect(() => {
  const themeConfig = THEMES[theme];
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', themeConfig.primary);
  root.style.setProperty('--color-background', themeConfig.background);
  root.style.setProperty('--color-surface', themeConfig.surface);
  // ... more variables
  
  document.body.className = `theme-${theme}`;
}, [theme]);
```

### Available Themes

| Theme | Description |
|-------|-------------|
| `light` | Clean light theme |
| `dark` | Dark mode |
| `clean` | Minimal blue accent |
| `paper` | Sepia/newspaper style |
| `green` | Terminal green phosphor |
| `amber` | Retro amber CRT |
| `ocean` | Deep blue tones |
| `monochrome` | Pure black and white |

---

## Key Patterns

### 1. Selective Zustand Subscriptions

Components subscribe only to the state they need, preventing unnecessary re-renders:

```typescript
// Good: Selective subscription
const timer = useStore((state) => state.game.timer);

// Avoid: Subscribing to entire store
const store = useStore();  // Re-renders on ANY change
```

### 2. Grid State Cloning

All grid mutations create new arrays to ensure React detects changes:

```typescript
const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({
    ...cell,
    manualNotes: [...cell.manualNotes],
    autoNotes: [...cell.autoNotes],
    userEditedInAuto: [...cell.userEditedInAuto],
  })));
};
```

### 3. History Management

Undo/redo is implemented by storing grid snapshots:

```typescript
// On each change:
const newHistory = state.history.slice(0, state.historyIndex + 1);
newHistory.push(cloneGrid(newGrid));
// historyIndex points to current state
```

### 4. Conditional Rendering for Overlays

Modals render `null` when inactive to avoid DOM overhead:

```typescript
const VictoryModal = () => {
  const isComplete = useStore((state) => state.game.isComplete);
  if (!isComplete) return null;  // Not in DOM
  return <div className={styles.overlay}>...</div>;
};
```

### 5. Responsive Layout Strategy

GameLayout renders both mobile and desktop layouts, controlled by CSS:

```tsx
<main className={styles.main}>
  <div className={styles.mobileLayout}>  {/* display: none on desktop */}
    ...
  </div>
  <div className={styles.desktopLayout}> {/* display: none on mobile */}
    ...
  </div>
</main>
```

---

## Storage Schema

The store persists to localStorage under key `sudoku-storage`:

```typescript
{
  _version: 3,  // Schema version for migrations
  game: { /* GameState */ },
  settings: { /* SettingsState */ },
  stats: { /* Statistics */ },
  history: [ /* Cell[][][] */ ],
  historyIndex: number
}
```

Breaking changes to state structure require incrementing `STORAGE_VERSION` and implementing migration logic.

---

## Future Considerations

Areas that could be extended:

- **Audio/SFX**: Sound effects for moves, wins, errors
- **Animations**: Framer Motion for cell transitions, victory effects
- **Multiplayer**: Would require WebSocket integration
- **Daily puzzles**: Would require server-side puzzle generation
- **Statistics expansion**: Track streaks, average times, completion rates

---

## Viewing This Document

This document uses [Mermaid](https://mermaid.js.org/) for diagrams.

- **GitHub**: Diagrams render automatically
- **VS Code**: Install the "Markdown Preview Mermaid Support" extension
- **Local preview**: Use [mermaid.live](https://mermaid.live) to test individual diagrams

---
