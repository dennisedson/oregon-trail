PROJECT_SPEC: The Anthropic Trail (Interactive Resume)
1. Vision & Purpose
The Mission: Build an interactive, web-based "candidate agent" for a Developer Education Lead position at Anthropic.
The Theme: A 1980s retro "Oregon Trail" style game. The user (a Hiring Manager) navigates a career journey instead of a geographic one.
The "Flex": This project must demonstrate elite prompt engineering, developer experience (DX) principles, and mastery of the Anthropic Claude API.

2. Tech Stack
Framework: Next.js 14+ (App Router), Tailwind CSS.

AI Engine: Anthropic Claude 3.5 Sonnet (via SDK).

Backend/DB: Supabase (PostgreSQL) for session persistence and "game state."

Styling: Retro-terminal aesthetic (Font: VT323, Colors: CRT Green on Black).

3. Core Components & Logic
A. The "Game Master" (LLM)
Role: Claude 3.5 Sonnet acts as the narrator and engine.

Knowledge Base: Uses bio.md (in root) containing my full professional history, achievements, and educational philosophy.

Constraints: Must stay in character as a 19th-century trail guide who is also a technical recruiter. Must never hallucinate facts not found in bio.md.

B. Game State (Supabase)
Columns: session_id, current_milestone (Phase 1-4), resources (Budget, Morale, Tech Debt), log (History of decisions).

Mechanic: If "Tech Debt" hits 100, the user "Dies of Dysentery" (fails the hire).

C. The Interface
Primary View: A terminal-style output window for narrative text.

The "Command Deck": - 3-4 dynamic action buttons (e.g., "Review Portfolio," "Discuss Management Style").

A hidden "Developer Console" that reveals the raw system prompt and Claude's "thinking" process (demonstrating transparency and interpretability).

4. Milestone Map (The Trail)
The Starting Outpost: Background and Education.

The High Plains: Previous major roles and technical leadership.

The River Crossing: Handling complex Dev Ed challenges (The "Manager Test").

The Anthropic Valley: Alignment with Anthropic’s mission (Safety, PBC status).

5. Development Guidelines (For the Coding Agent)
Modular Code: Keep API routes, Supabase clients, and UI components strictly separated.

System Prompting: The system_prompt for Claude should be stored in a dedicated lib/prompts.ts file for easy iteration.

Error Handling: Gracefully handle API rate limits or Supabase connection issues with retro-themed error messages (e.g., "Wagon Axle Broken: 500 Internal Server Error").

Safety First: Ensure no API keys are hardcoded; use .env.local for all secrets.

Instructions for the AI Coding Agent:
"Read the PROJECT_SPEC.md and the bio.md file. Your first task is to scaffold the Next.js project with Tailwind and the VT323 Google Font. Once the UI shell is ready, help me set up the Supabase schema for session tracking."