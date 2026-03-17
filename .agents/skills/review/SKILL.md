---
name: ai-explode-review
description: >
  Use when code changes in the ai-explode repository must be reviewed before commit.
  This skill reviews only the current uncommitted changes in the working tree,
  including staged, unstaged, and relevant untracked files. It checks whether
  the changes are correct, complete, aligned with the specification and
  implementation plan, and consistent with the backend/frontend architecture.
triggers:
  - review changes
  - review uncommitted changes
  - review current implementation
  - review working tree
  - review feature implementation
  - code review before commit
  - review ai-explode changes
  - check current diff
  - review modified files
  - review pending changes
---

# SKILL: AI-Explode Review

## Purpose

Use this skill to review the current uncommitted changes in the `ai-explode`
repository before commit.

The repository is structured into two top-level directories:

- `backend` — PHP backend
- `frontend` — Vue 3 + TypeScript frontend

This skill reviews only the code that is currently changed in the working tree.

The purpose is to detect correctness issues, architectural violations,
scope drift, incomplete implementation, missing validation, and missing tests
before the changes are committed.

---

## Review scope

The source of truth for what must be reviewed is the current uncommitted Git state.

Review only:

- staged changes
- unstaged changes
- relevant untracked files that are part of the current implementation

Do not perform a full repository review unless explicitly requested.

Do not treat unrelated legacy code as part of the review unless it is necessary
to understand the changed code.

If surrounding context is needed, read the smallest relevant amount of adjacent
code required to understand the change correctly.

---

## Core rule

Review only the current uncommitted changes.

The goal is not to review the whole repository.

The goal is to review the pending implementation represented by the current
working tree diff.

---

## Primary responsibilities

This skill is responsible for:

- identifying the files that are part of the current uncommitted change set
- reviewing the changed code for correctness and completeness
- checking alignment with the feature specification
- checking alignment with the implementation plan
- checking whether the implementation stays within approved scope
- detecting backend/frontend boundary violations
- detecting API contract drift between layers
- checking whether tests were updated where needed
- identifying missing validation, error handling, or security handling
- producing a structured review result

---

## Inputs to consider

When available, review the current changes against:

- the feature specification
- the implementation plan
- existing repository conventions
- the current architectural split between `backend` and `frontend`

If specification or implementation plan is missing, still perform the review,
but explicitly state that the review is limited to code quality, consistency,
and visible intent in the current changes.

---

## Repository architecture rules

### Backend

- All backend code belongs in `backend`.
- Backend implementation is in PHP.
- Business logic belongs in the backend.
- Authorization belongs in the backend.
- Security-critical and business-critical validation belongs in the backend.
- Persistence concerns belong in the backend.

### Frontend

- All frontend code belongs in `frontend`.
- Frontend uses Vue 3 and TypeScript.
- Frontend should focus on presentation, interaction, and user experience.
- Frontend validation supports UX, but must not be treated as authoritative.
- New Vue code should follow the existing project conventions.

### Cross-layer expectations

- Frontend and backend must remain cleanly separated.
- API contract changes must be reflected consistently across both layers.
- The review should detect silent contract mismatches.
- The review should detect hidden coupling between frontend and backend.

---

## Review workflow

Follow this sequence:

1. Identify the current uncommitted files and changed areas.
2. Read the smallest relevant diff-oriented context.
3. Determine whether the changes affect:
    - `backend`
    - `frontend`
    - both layers
4. Review the changed code against:
    - correctness
    - scope
    - architecture
    - consistency
    - validation
    - test coverage impact
5. Summarize findings in a structured review output.

---

## What to review

### 1. Correctness

Check whether the changed code appears logically correct.

Look for:

- broken logic
- inconsistent state handling
- incorrect assumptions
- missing edge case handling
- obvious runtime risks
- incomplete changes across affected layers

### 2. Specification alignment

If a specification exists, check whether the implementation matches it.

Look for:

- missing required behavior
- behavior added beyond the specification
- mismatches in scope
- missing acceptance-criteria coverage

### 3. Implementation-plan alignment

If an implementation plan exists, check whether the current change set aligns
with the intended execution plan.

Look for:

- skipped important work packages
- missing dependencies
- sequencing mistakes reflected in code
- incomplete implementation slices

### 4. Scope discipline

Check whether the implementation stayed focused.

Look for:

- unrelated refactoring
- speculative abstractions
- opportunistic cleanup outside the feature scope
- changes that do not belong to the approved task

### 5. Architecture and layering

Check whether backend/frontend boundaries are preserved.

Look for:

- business logic moved into the frontend
- security assumptions placed in the frontend only
- UI concerns leaking into backend design
- direct coupling that breaks the intended layer separation

### 6. API and integration consistency

If the change spans backend and frontend, review the integration boundary.

Look for:

- request/response mismatches
- missing frontend adaptation after backend changes
- undocumented new fields or behaviors
- inconsistent error handling across the boundary

### 7. Validation and security

Check whether validation and security responsibilities are correctly placed.

Look for:

- missing backend validation
- authorization handled only in the frontend
- unsafe assumptions about client input
- exposure of internal-only data or configuration
- token/session/header misuse

### 8. Error handling and UX behavior

For frontend-visible changes, check whether user-facing behavior is complete.

Look for:

- missing loading states
- missing empty states
- missing error states
- unclear user feedback
- inconsistent validation feedback

### 9. Tests and validation impact

Check whether the change likely required test updates.

Look for:

- changed behavior without corresponding tests
- missing regression protection
- missing API/integration/UI test adaptation
- lack of validation evidence for risky changes

### 10. Maintainability

Check whether the changed code remains maintainable.

Look for:

- unnecessary complexity
- duplication introduced by the change
- hidden side effects
- poor naming in changed code
- brittle or hard-to-follow additions

---

## Severity model

Classify findings using these levels:

### Critical

Use for issues that likely cause broken behavior, security risk,
data integrity issues, or severe contract mismatch.

### Major

Use for issues that materially reduce correctness, completeness,
or architectural quality and should be fixed before commit.

### Minor

Use for issues that improve robustness, readability, maintainability,
or consistency, but are not likely release blockers on their own.

### Note

Use for observations, follow-up ideas, or low-risk improvements.

---

## Review output format

Produce a structured review result with these sections:

# Review Result

## 1. Scope Reviewed

State that the review covered only the current uncommitted changes.

Mention whether the change affected:

- `backend`
- `frontend`
- both

Mention whether specification and implementation plan were available.

## 2. Summary

Provide a concise overall review summary.

State whether the current changes appear:

- ready
- mostly ready with fixes
- not ready

## 3. Findings

List findings grouped by severity:

### Critical
- item

### Major
- item

### Minor
- item

### Notes
- item

For each finding, include:

- what the issue is
- why it matters
- where it appears
- what should be corrected at a high level

Do not generate patches unless explicitly requested.

## 4. Missing or Risky Areas

List areas that could not be fully validated from the current changes alone.

Examples:

- missing specification
- incomplete test evidence
- unclear intended behavior
- backend/frontend contract uncertainty

## 5. Final Verdict

Provide a short verdict such as:

- ready to commit
- ready after minor fixes
- needs major fixes before commit

---

## Review principles

- Focus on the actual changed code.
- Be strict about correctness and architecture.
- Do not inflate the review with unrelated legacy observations.
- Prefer grounded findings over speculative criticism.
- Keep the review actionable and precise.
- If uncertain, say so explicitly.

---

## File discipline during review

- Read only files needed to understand the uncommitted changes.
- Prefer diff-oriented inspection.
- Read adjacent unchanged code only when necessary for context.
- Do not expand into a full codebase audit.

---

## What to avoid

Never do any of the following unless explicitly requested:

- review the entire repository
- criticize unrelated unchanged code
- invent requirements that are not grounded in the spec, plan, or visible intent
- silently assume that changed frontend validation is sufficient for security
- ignore missing backend validation for security-relevant flows
- output implementation patches as part of the default review
- switch from review into implementation

---

## Final reminder

This skill reviews only the current uncommitted changes.

It does not perform implementation.

It does not perform a full repository audit.