---
name: ai-explode-implementation-executor
description: >
  Use when an approved specification and implementation plan already exist
  and the next step is to implement the feature in the ai-explode project.
  This skill executes the implementation in the correct layer, preserves
  the backend/frontend boundary, updates affected tests, and validates
  the result.
triggers:
  - implement feature
  - execute implementation
  - implement approved specification
  - implement approved plan
  - implement ai-explode feature
  - code from specification
  - code from implementation plan
  - apply implementation plan
  - execute feature plan
  - implement full-stack feature
---

# SKILL: AI-Explode Implementation Executor

## Purpose

Use this skill to implement an approved feature for the `ai-explode` project
based on an existing specification and implementation plan.

This repository is structured into two top-level directories:

- `backend` — PHP backend
- `frontend` — Vue 3 + TypeScript frontend

The purpose of this skill is to execute implementation work in the correct
layer, preserve architectural boundaries, and validate the result.

---

## Preconditions

This skill should only be used when:

- a feature specification already exists
- an implementation plan already exists
- implementation is explicitly desired

If specification or planning input is incomplete, proceed with the most
grounded interpretation possible, keep scope tight, and state assumptions
clearly in the final summary.

Do not block unnecessarily on ambiguity if the intended implementation
direction is sufficiently clear.

---

## Core rule

Implement only what is required by the approved specification and
implementation plan.

Do not expand scope beyond the approved feature.

---

## Primary responsibilities

This skill is responsible for:

- reading and understanding the relevant specification
- reading and understanding the implementation plan
- identifying whether the work belongs to:
    - `backend`
    - `frontend`
    - both layers
- implementing the required changes
- preserving the contract boundary between frontend and backend
- updating relevant tests when behavior changes
- validating the affected areas where possible
- reporting assumptions, scope, and validation status clearly

---

## Repository boundaries

### Backend

- All backend code belongs in `backend`.
- Backend implementation is in PHP.
- Business logic belongs in the backend.
- Authorization belongs in the backend.
- Security-critical and business-critical validation belongs in the backend.
- Persistence concerns belong in the backend.
- Prefer thin controllers/endpoints and place logic in the established service
  or application-layer abstractions where appropriate.
- Do not move authoritative domain behavior into the frontend.

### Frontend

- All frontend code belongs in `frontend`.
- Frontend is implemented with Vue 3 and TypeScript.
- Use the Composition API for new Vue code.
- Prefer `<script setup lang="ts">` for new components.
- Keep components focused, readable, and reusable where appropriate.
- Keep presentation and interaction logic in the frontend.
- Do not place domain-authoritative backend rules in UI components.

### Cross-layer work

- Treat the API boundary as explicit and important.
- If request or response contracts change, update both sides consistently.
- Do not invent undocumented endpoints, fields, or backend behavior.
- Keep the integration between `backend` and `frontend` synchronized.

---

## Execution workflow

Follow this sequence:

1. Read the feature specification.
2. Read the implementation plan.
3. Identify the exact implementation scope.
4. Determine whether the task affects `backend`, `frontend`, or both.
5. Inspect the smallest relevant set of files.
6. Reuse established project patterns and conventions.
7. Implement the minimal coherent change that fully solves the task.
8. Update tests if behavior changes.
9. Run the relevant validation commands where possible.
10. Summarize:
- implemented scope
- affected areas
- assumptions
- validation performed
- remaining limitations or follow-up points

---

## Scope discipline

Implement only the requested feature.

Do not:

- add unrelated refactorings
- rewrite working code without strong reason
- introduce speculative abstractions
- implement optional extras unless explicitly requested
- silently broaden the change set
- fix unrelated issues as part of the same task unless required for correctness

If adjacent issues are discovered, mention them separately in the final summary,
but do not absorb them into the implementation unless necessary.

---

## Frontend implementation rules

### Technology and style

- Use Vue 3 and TypeScript.
- Follow the existing Vite-based project conventions.
- Prefer typed models and explicit interfaces/types where appropriate.
- Follow the existing API integration pattern.
- Prefer a dedicated API access layer over scattered HTTP logic.
- Handle loading, empty, and error states explicitly where relevant.

### Component design

- Prefer small, focused components.
- Avoid excessive inline logic in templates.
- Use computed properties for derived state.
- Extract reusable behavior into composables when complexity justifies it.
- Keep temporary UI state local unless shared state is genuinely needed.

### Validation

- Frontend validation primarily supports UX.
- Never rely on frontend validation alone for integrity or security.

---

## Backend implementation rules

### Domain and application behavior

- Keep business logic in the established backend structures.
- Centralize domain rules where possible.
- Validate security-relevant and business-critical inputs on the backend.
- Assume frontend input may be invalid, incomplete, or manipulated.

### API behavior

- Keep request/response handling consistent with the existing application style.
- Preserve backward compatibility unless the specification explicitly allows
  or requires a breaking change.
- Keep error handling predictable and aligned with existing backend patterns.

### Persistence and data handling

- Make persistence changes only when required by the feature.
- Keep data changes aligned with the domain intent.
- Avoid unnecessary schema or structural changes.

---

## Testing and validation

After implementation, validate the changed area as far as possible.

### For backend changes

Run relevant checks if available, such as:

- dependency installation if needed
- linting
- static analysis
- unit tests
- integration or API tests

### For frontend changes

Run relevant checks if available, such as:

- dependency installation if needed
- type-checking
- linting
- unit tests
- production build

### Validation reporting

Never claim completion without stating validation status.

Always report:

- which checks were run
- which checks passed
- which checks could not be run
- whether validation remains partial

---

## Security rules

- The backend is the authority for authentication and authorization.
- Never enforce authorization only in the frontend.
- Do not expose secrets, credentials, or internal-only configuration in
  frontend code.
- Be careful with tokens, sessions, headers, and user-specific data.
- Preserve the existing security model unless the task explicitly requires
  a security-related change.

---

## Dependency rules

- Prefer existing dependencies already used in the project.
- Do not add new dependencies unless clearly necessary.
- If a new dependency is introduced, explain why it is needed.
- Avoid overlapping libraries that duplicate existing capabilities.

---

## File discipline

- Read only the files needed for the task.
- Edit only files relevant to the requested feature.
- Do not rewrite unrelated files.
- Do not create broad formatting churn.
- Keep diffs focused and reviewable.

---

## Decision guidance

When multiple implementation approaches are possible:

1. prefer the existing project pattern
2. prefer the simpler maintainable solution
3. prefer the smaller safe change
4. prefer explicitness and type safety
5. prefer stricter preservation of backend/frontend separation

If an assumption is unavoidable, choose the most conservative reasonable option
and document it in the final summary.

---

## What to avoid

Never do any of the following unless explicitly required:

- broad refactoring outside the approved scope
- introducing a second architectural style
- moving business logic from backend to frontend
- scattering HTTP calls directly across many Vue components when an API layer exists
- silently changing contracts without coordinated updates
- bypassing validation or authorization rules
- inventing missing requirements without stating assumptions
- claiming full completion without validation context

---

## Expected final response style

At the end of the task, provide a concise execution summary with:

- implemented scope
- affected areas (`backend`, `frontend`, or both)
- key changes made
- assumptions
- validation performed
- known limitations or follow-up points

Be precise, grounded, and implementation-focused.