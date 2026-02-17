# Product Requirements Document (PRD): Feedback Town (Working Title)

> **Status:** DRAFT - Iteration 2
> **Last Updated:** 2026-02-17
> **Tech Stack:** Next.js, Supabase, Tailwind, Playwright

## 1. Executive Summary

A real-time, gamified classroom feedback application where students join a virtual "Town". Instead of clicking buttons on a form, students control an avatar and move to specific physical locations in the town to vote, express feelings, or group up.

## 2. User Personas

### 🧑‍🏫 The Professor (The Mayor)

- **Role:** Host & Admin.
- **Actions:**
  - Starts a session (City Hall).
  - Broadcasts questions which change the "Town Layout" (e.g., A/B zones appear).
  - Views aggregate data (heatmaps of where students are).
- **Needs:** Zero-friction setup, persistent history of class engagement.

### 🧑‍🎓 The Student (The Citizen)

- **Role:** Participant.
- **Actions:**
  - Joins via QR/Link (Guest access, persistent via cookies).
  - Customizes a simple Avatar.
  - **Moves** to answer. (e.g., "Walk to the left for YES, right for NO").
- **Needs:** Fun, mobile-responsive, "Game-feel".

## 3. Interaction Logic ("The Farmville of Feedback")

### Movement-Based Answering

The core mechanic is spatial.

- **Multiple Choice:** The screen is divided into huge zones (A, B, C, D). Students walk their avatar to the zone.
- **Spectrum/Slider:** A long road. "How tired are you?" (Left = Fresh, Right = Zombie). Students position themselves along the road.
- **Word Cloud:** (To be defined: Maybe students type a word and it appears as a bubble above their head, or they group by common words).

## 4. Technical Architecture

### Stack

- **Frontend:** Next.js (React).
- **Styling:** Tailwind CSS (UI) + Framer Motion (Animations).
- **Game/Visuals:**
  - _Decision:_ We will likely use **HTML5 Canvas** or a lightweight game library (like Phaser or just separate DOM nodes if performance allows < 100 users) for the town view to ensure smooth real-time movement.
  - _Constraint:_ Must work perfectly on Mobile (touch to move).
- **Backend / Real-time:** Supabase.
  - **Database:** PostgreSQL (Stores Sessions, Questions, User History).
  - **Real-time:** Supabase Realtime channels to sync Avatar coordinates (x,y) to all clients.
- **Auth:**
  - **Teacher:** Email/Social (Supabase Auth).
  - **Student:** Anonymous/Guest (Uuid stored in LocalStorage/Cookies). Upgradable to full account later.

### Testing Strategy (Strict TDD)

- **Unit:** Vitest (for utility logic, state management).
- **E2E:** Playwright.
  - _Scenario:_ Spawning 20 "bot" browsers to simulate a class load and verify real-time sync.
- **CI/CD:** GitHub Actions.
  - Linting (ESLint, Prettier).
  - Type Checking (TypeScript).
  - Test Runner.

## 5. Development Roadmap (MVP)

1.  **Project Setup:** Repo, Linting rules, CI pipeline.
2.  **The "Lobby":** connection handling, guest auth, joining a room.
3.  **The "Playground":** Rendering a usage canvas, handling "Move" events, syncing to Supabase.
4.  **The "Question" Engine:** Teacher changes mode -> Map changes zones.
5.  **Analytics:** Saving and viewing past session data.

## 6. Open Questions for Design

- **Visual Style:** Pixel Art? 3D Voxel? Flat Vector? (Assume Flat/Clean Vector for "Start Simple").
- **Max Capacity:** How many students per class? (Supabase Realtime quotas need checking for >100 simultaneous connections).
