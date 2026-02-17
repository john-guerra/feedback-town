# Project: Feedback Town

## Overview
Feedback Town is a Next.js application designed to facilitate feedback, likely for events or classrooms, with a focus on ease of use (e.g., guest logins).

## Tech Stack
-   **Framework**: Next.js 16.1.6 (App Router)
-   **Language**: TypeScript 5
-   **UI Library**: React 19.2.3
-   **Styling**: Tailwind CSS 4
-   **Backend/Auth**: Supabase (inferred from dependencies and file names)
-   **Testing**:
    -   **Unit/Integration**: Vitest (`npm test`)
    -   **E2E**: Playwright (`npm run test:e2e`)

## Key Commands
-   `npm run dev`: Start the development server (default port 3000).
-   `npm run build`: Build the application for production.
-   `npm start`: Start the production server.
-   `npm run lint`: Run ESLint.
-   `npm run format`: Format code with Prettier.
-   `npm test`: Run Vitest unit tests.
-   `npm run test:e2e`: Run Playwright end-to-end tests.

## Project Structure
-   `src/app`: App Router pages and layouts.
-   `src/components`: Reusable React components.
-   `src/lib`: Utility functions and shared logic (e.g., auth).
-   `tests/`: Playwright E2E tests.
-   `public/`: Static assets.

## Coding Standards & Patterns
-   **Imports**: Use the `@/` alias to refer to the `src` directory.
    -   Example: `import GuestLogin from '@/components/GuestLogin';`
-   **Components**: Use React Functional Components.
    -   Mark client-side components with `'use client';` at the top.
    -   Prefer Server Components where possible.
-   **Styling**: Use Tailwind CSS classes.
-   **Navigation**: Use Next.js `<Link>` component for internal navigation.
    -   *Note*: `window.location.href` is occasionally used for hard redirects where necessary (e.g., in `GuestLogin.tsx`).
-   **Linting**: Ensure code passes ESLint and Prettier checks before committing.
    -   Rules are defined in `eslint.config.mjs` and `.prettierrc`.

## Knowledge & Context
-   **Guest Access**: The app features a guest login system where users are assigned a Guest ID.
-   **Auth**: Custom auth logic seems to be located in `src/lib/auth`.
