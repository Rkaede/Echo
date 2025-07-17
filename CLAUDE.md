# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

- **Install dependencies**: `bun install`
- **Start development**: `bun run dev` (runs Electron with hot reloading)
- **Build application**: `bun run build` (runs typecheck + electron-vite build)
- **Type checking**: `bun run typecheck` (checks both node and web TypeScript)
- **Linting**: `bun run lint` (Biome check)
- **Lint with fixes**: `bun run lint:fix` (Biome check with auto-fixes)
- **Validate code**: `bun run validate` (runs lint + typecheck)

### Platform-specific builds

- **Windows**: `bun run build:win`
- **macOS**: `bun run build:mac`
- **Linux**: `bun run build:linux`

## Project Architecture

This is an Electron application that provides voice recording and transcription
functionality using the Groq Whisper API.

### Core Architecture

- **Main Process** (`src/main/`): Handles Electron app lifecycle, IPC, and Groq
  API integration
- **Renderer Process** (`src/renderer/`): React-based UI for voice recording
  interface
- **Preload** (`src/preload/`): Secure IPC bridge between main and renderer

### Key Components

#### Main Process (`src/main/index.ts`)

- Creates a frameless, always-on-top overlay window (140x40px)
- Registers global shortcut `Cmd/Ctrl+Shift+R` for recording toggle
- Positions window at bottom-right of screen
- Handles IPC communication for audio transcription

#### Audio Transcription (`src/main/services/groq-audio.ts`)

- Integrates with Groq SDK using Whisper Large V3 Turbo model
- Processes audio buffers from renderer process
- Creates temporary files for Groq API consumption
- Returns transcribed text with timestamps

#### UI Components (`src/renderer/src/components/`)

- **overlay.tsx**: Main UI component with animated states
  (idle/recording/processing)
- **use-voice-record.ts**: Hook for recording and transcribing audio
- Uses Framer Motion for smooth animations and state transitions

### Key Features

- Global shortcut recording toggle
- Automatic clipboard copying of transcriptions
- Temporary file cleanup after processing
- Always-on-top overlay with minimal UI
- Cross-platform support

### Environment Variables

- `GROQ_API_KEY`: Required for Groq Whisper API access

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Framer Motion)
- **Backend**: Electron, Node.js, Groq SDK
- **Build Tools**: Electron Vite, Biome (linting/formatting)
- **Audio**: MediaRecorder API, WebM format

### Development Notes

- Application creates a small overlay UI that stays on top of all applications
- Recording is triggered via global shortcut, not UI clicks
- Audio is processed in main process for security (API key isolation)
- Uses electron-vite for development with hot reloading

### Coding Guidelines

- Use bun for installing dependencies and running npm scripts
- ALWAYS run `bun run validate` before considering any code changes complete
- Fix all linter and TypeScript errors immediately - don't leave them for the
  user to fix
- Assume that the dev server is always running. You should not try and start it
- Don't use explicit return types unless needed
- All files should be kebab-case
- Use named functions instead of arrow functions unless it's a one-liner
- Prefer named exports over default exports
