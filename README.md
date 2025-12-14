# Sudoku Terminal

A modern, terminal-themed Sudoku game built with React, TypeScript, and Vite. Part of the [kahdev.me](https://kahdev.me) project collection.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)

## Features

### Core Gameplay
- **Three difficulty levels**: Easy, Medium, and Hard with appropriate challenge
- **Real puzzle generation**: Unique, solvable puzzles every time using proven algorithms
- **Smart input**: Number pad, keyboard support, and arrow key navigation
- **Pencil mode**: Add corner notes to track possible numbers
- **Mistake highlighting**: Visual feedback for incorrect entries
- **Win detection**: Automatic victory screen when puzzle is complete

### Quality of Life
- **Undo/Redo**: Full history with Ctrl+Z / Ctrl+Shift+Z shortcuts
- **Hint system**: Get help when stuck
- **Cell highlighting**: Highlights related rows, columns, boxes, and matching numbers
- **Timer**: Track your solving time with pause/resume
- **Auto-save**: Progress automatically saves to localStorage
- **Statistics tracking**: Best times and games completed

### Aesthetics
- **Four terminal themes**: Green Phosphor, Classic Amber, Paper, and Monochrome
- **Terminal styling**: Monospaced fonts, glow effects
- **Platform**: Optimized for both desktop and mobile

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/khesse-757/sudoku-game.git
cd sudoku-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Local Network Testing (Mobile)

The dev server allows connections from your local network:

1. Find your local IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

2. Access from your phone: `http://[YOUR_IP]:5173`

## How to Play

### Basic Controls
- **Click** or **arrow keys** to select cells
- **1-9** to enter numbers
- **Backspace/Delete** to clear
- **N** or **P** to toggle pencil/notes mode
- **Ctrl+Z** to undo, **Ctrl+Shift+Z** to redo

### Tips
- Use pencil mode to mark possible numbers in cells
- Watch for mistake highlighting (red cells)
- Use hints wisely
- Cell highlighting shows related cells automatically

## Project Structure

```
src/
├── components/
│   ├── Grid/          # Sudoku grid and cell components
│   ├── Controls/      # Game controls (timer, buttons, number pad)
│   ├── UI/            # UI components (modals, stats, theme switcher)
│   └── Layout/        # Main layout wrapper
├── hooks/             # Custom React hooks
├── store/             # Zustand state management
├── utils/             # Helper functions and puzzle generation
├── types/             # TypeScript type definitions
└── styles/            # Global CSS and themes
```

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with persist middleware
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Puzzle Generation**: sudoku library
- **Styling**: CSS Modules with CSS Variables

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This project is configured for GitHub Pages deployment:

1. Update `vite.config.ts` base path if needed
2. Push changes to GitHub
3. GitHub Actions will automatically build and deploy

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Themes

The app includes four terminal-inspired themes:

- **Green Phosphor**: Classic green-on-black terminal aesthetic
- **Classic Amber**: Warm amber text on dark background
- **Paper**: Inverted black-on-cream for reduced eye strain
- **Monochrome**: Pure black and white minimalism

## Contributing

This is a personal project, but feel free to fork and customize it

## License

MIT License

## Acknowledgments

- Puzzle generation powered by the `sudoku` npm package
- Terminal aesthetic inspired by classic Unix terminals

