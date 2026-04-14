# Copilot Instructions for University Portal Frontend

## Project Context
- This repository is a Next.js 16 frontend application for a University Portal.
- Primary language is TypeScript. 
- All API calls are made to an external backend API. Do not generate local Next.js API routes (`app/api` or `pages/api`) or server actions for database operations unless a explicitly requested for it.

## 📦 Project Stack & Context
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Backend:** External NestJS API (No local Prisma/DB)
- **Data Fetching:** TanStack React Query v5
- **State Management:** Zustand (UI State ONLY)
- **Validation:** Zod + React Hook Form
- **Styling:** Tailwind CSS (Light/Dark mode enabled)
- **Animation:** Framer Motion (Page transitions) & GSAP (Scroll/Complex)


## API Integration
- All API calls go through centralized services
- All services should reuse the src\lib\clients\apiClient.ts
- Use environment variables for base URLs
- Handle errors gracefully
- Never hardcode API URLs in components

## Implementation Rules
- Maintain strict separation of concerns
- Prefer reusable abstractions where appropriate, but avoid premature abstraction
- Do not duplicate logic — reuse from global or module scope
- Keep components small, focused, and composable
- Use proper TypeScript types — avoid `any`
- Prefer functional components and hooks
-NEVER create a new global CSS file. Use Tailwind utilities (unless explicitly requested to create a new CSS module for a specific component or feature) and unless the utility class does not exist in tailwind.
- NEVER skip Zod validation before sending data to the backend.
- NEVER mix 'use client' and 'use server' directives incorrectly. If a component uses hooks, it MUST be 'use client'.
- Class Merging: ALWAYS use cn() utility for Tailwind.
- For components, use the installed version syntax and class names of tailwind. Do not use custom class names or styles unless explicitly requested to create a new CSS module for a specific component or feature.

## Architecture & Folder Structure
- Enforce a strict **Modular Pattern** separating global utilities from feature-specific logic.
- **Global Assets:** Keep reusable, cross-cutting logic at the root level(observe if it has a src directory)  (`/hooks`, `/providers`, `/services`, `/lib`, `/components`, `/schemas`, `/types`).
- **Modular Assets:** Co-locate domain-specific or peculiar logic directly within its respective module directory (e.g., `/roles/hooks`, `/roles/components`, `/roles/schemas`, `/roles/types`). Do not leak module-specific code into the global directories.

## Tech Stack Rules
- **Data Fetching:** Use `@tanstack/react-query` for all external API queries and mutations. Abstract these into custom hooks rather than cluttering UI components.
- **State Management:** Use `zustand`. Keep stores modular and avoid unnecessary global state if local component state suffices.
- Use Zustand only for:
  - global UI state
  - cross-component shared state
- Do NOT use Zustand for server data (use React Query instead)
- **Styling & Theming:** Use `tailwindcss`. Ensure all UI code natively supports both light and dark modes (always include `dark:` utility variants where applicable). use the tailwind installed version syntax and class names.
- **Validation:** Use `zod` for all form validations, parameter checks, and API payload schemas. Infer TypeScript types directly from Zod schemas (`z.infer<typeof schema>`).
- Integrate with React Hook Form using `zodResolver`
- Keep schemas:
  - global → if reusable
  - module → if feature-specific
- **Animations:** Use `framer-motion` for standard UI transitions, layout animations, and micro-interactions. Default to `gsap` for complex, timeline-based, or heavy scroll-driven animations. 

## UI & Components
- Prefer ShadCN UI + Radix UI for components
- Extend components instead of rewriting
- Ensure accessibility (ARIA, keyboard navigation)

## Implementation & Quality Checks
- Prioritize **Reusability** and **Separation of Concerns (SoC)**. UI components should focus strictly on presentation, delegating business and fetching logic to custom hooks or services.
- Follow existing file naming patterns (e.g., `*.tsx` for components, `*.ts` for logic).
- Avoid `any` or `unknown`. Default to strongly typed generic interfaces.
- Keep changes scoped specifically to the requested feature or module without randomly refactoring unrelated global assets.
- Avoid unnecessary dependencies
- Write readable, maintainable code

## Communication
- If a requested change violates the modular folder structure (e.g., putting a role-specific type in the global `/types` folder), warn me, explain the structural conflict, and provide the modular alternative.
- Explain architectural assumptions briefly when requirements are ambiguous.
