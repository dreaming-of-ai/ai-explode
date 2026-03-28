# AGENTS.md

## Purpose

This repository contains the project `ai-explode`.

It is structured into two main directories:

- `backend` — PHP backend
- `frontend` — Vue 3 + TypeScript frontend

Agents must preserve a strict separation between backend and frontend and follow the documented workflow for specification, planning, implementation, and review.

---

## Required workflow

For feature work in `ai-explode`, follow this sequence unless explicitly instructed otherwise:

1. Use the `.agents/skills/specification-writer` skill to create or refine the feature specification.
2. Use the `.agents/skills/implementation-plan-writer` skill to derive a structured implementation plan.
3. Use the `.agents/skills/implementation-executor` skill only after specification and plan exist.
4. Before commit, use the `.agents/skills/review` skill to review the current uncommitted changes only.

Do not implement directly from a vague request when specification and planning are still missing.

---

## Feature documentation

All feature specifications and implementation plans must be managed under `papers`.
Additionally, screenshots of the feature in action are placed under `papers/done/screenshots`.

### Directory structure

- `papers/game-overview.md`  
  canonical high-level overview of the game, including long-lived vision, terminology, and cross-feature context, this document is only maintained manually and must never be changed

- `papers/in-progress`  
  contains the active specification and implementation plan for the feature currently being worked on

- `papers/done/specs`  
  contains completed feature specifications

- `papers/done/plans`  
  contains completed implementation plans

### Naming convention

All specification and implementation plan documents must follow this pattern:

`YYYY-MM-DD_SPEC_<short-feature-title>.md`  
`YYYY-MM-DD_PLAN_<short-feature-title>.md`

Examples:

- `2026-03-17_SPEC_user-login-audit.md`
- `2026-03-17_PLAN_user-login-audit.md`

### Naming rules

- Use the current date in `YYYY-MM-DD` format.
- Use `SPEC` for specifications and `PLAN` for implementation plans.
- Use a short, descriptive, lowercase feature title.
- Separate words with hyphens.
- Do not use spaces or special characters.
- The spec and plan for the same feature must use the same short feature title.

### Workflow rules

- New or active feature documents must be created in `papers/in-progress`.
- Keep specifications and implementation plans as separate files.
- Do not create multiple active specs or plans for the same feature unless explicitly required.
- Once a feature is completed, move:
    - the specification to `papers/done/specs`
    - the implementation plan to `papers/done/plans`

### Use of `papers/game-overview.md`

`papers/game-overview.md` is the canonical high-level product overview for the game.

Use it to capture durable product context such as:

- overall game concept
- core gameplay idea
- high-level rules
- intended game modes
- long-term direction
- future capabilities
- shared terminology
- important conceptual constraints

This file is not the active implementation spec for the current task.

When creating or updating a spec or plan:

1. read `papers/game-overview.md` first
2. align the feature with the overall game vision
3. keep the active spec focused on one concrete implementation slice
4. explicitly reference `papers/game-overview.md` when relevant
5. do not infer implementation scope from the overview alone

The active scope is always determined by the current spec and plan in `papers/in-progress`.

---

## Repository architecture

- All PHP backend code belongs in `backend`.
- All Vue frontend code belongs in `frontend`.
- Communication between frontend and backend must happen through HTTP APIs.
- Keep the API boundary explicit and stable.
- Do not mix backend code into `frontend` or frontend code into `backend`.
- Treat both directories as separate application layers with a clear contract boundary.

Before making changes, determine whether the task affects:

- `backend`
- `frontend`
- both layers through an API contract change

---

## Implementation rules

- Follow existing conventions before introducing new patterns.
- Make the smallest coherent change that fully solves the task.
- Keep changes focused on the approved scope.
- Do not introduce large architectural rewrites unless explicitly requested.
- Reuse existing patterns, utilities, and dependencies where reasonable.
- Do not add new dependencies unless clearly necessary.
- Keep frontend and backend changes synchronized when contracts change.
- Do not invent undocumented endpoints, fields, or behaviors.

---

## Layer responsibilities

### Frontend

The frontend is responsible for presentation, interaction, client-side flow, and local UI state.

Use these rules:

- use Vue 3 and TypeScript for new frontend code
- prefer Composition API and `<script setup lang="ts">`
- keep components focused and readable
- prefer a dedicated API access layer over scattered HTTP calls
- handle loading, empty, and error states explicitly
- do not place backend-authoritative business rules or security decisions in the frontend

### Backend

The backend is responsible for business logic, persistence, authorization, and authoritative validation.

Use these rules:

- keep backend implementation in PHP
- keep business logic and sensitive validation in the backend
- treat the backend as the source of truth for domain rules
- keep API request/response behavior consistent
- keep controllers/endpoints thin where practical and place logic in established backend abstractions

---

## File discipline

- Read only the smallest relevant set of files needed for the task.
- Modify only files relevant to the requested feature.
- Do not rewrite unrelated files.
- Do not introduce broad formatting churn.

---

## Validation and security

After changes, validate the affected layer as far as possible.

### Backend validation

Run relevant backend checks if available, such as:

- dependency installation
- linting
- static analysis
- unit tests
- integration or API tests

### Frontend validation

Run relevant frontend checks if available, such as:

- dependency installation
- type-checking
- linting
- unit tests
- production build

### Validation reporting

- Do not claim success without validation.
- If validation could not be run, state that explicitly.
- Mention which checks were run and which were not run.

### Security rules

- Treat the backend as the authority for authentication and authorization.
- Do not enforce authorization only in the frontend.
- Do not expose secrets or internal-only configuration in frontend code.
- Be careful with tokens, sessions, credentials, and user-specific data.
- Preserve existing security flows unless the task explicitly requires changes.

---

## Expected working style

When responding to implementation tasks:

- briefly explain the issue
- describe the chosen approach
- keep the change focused
- mention assumptions
- mention validation performed
- mention risks or follow-up points if relevant

---

## Learnings

- Whenever you have learned something important on the system architecture, design patterns, or domain that might be
  relevant for future tasks add this to the `LEARNINGS.md` file.

- Use the learnings to improve your future implementations and to avoid making the same mistakes again.