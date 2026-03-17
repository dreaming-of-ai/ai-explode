---
name: specification-writer
description: >
  Use when a feature, change request, enhancement, or new idea must be
  turned into a structured specification document before any implementation.
  This task is strictly analysis and specification only. Never implement.
triggers:
  - specify feature
  - create specification
  - write spec
  - feature specification
  - requirements document
  - functional concept
  - technical concept
  - clarify scope
  - define acceptance criteria
---

# SKILL: Feature Specification Writer

## Purpose

Use this skill to transform a feature request, idea, bug-related enhancement,
or vague product need into a structured Markdown specification document.

The output of this skill is always a specification document in Markdown.

This skill is strictly limited to analysis, clarification, structuring,
and documentation of the requested feature.

## Hard rule

During this task, never implement anything.

This means in particular:

- do not write production code
- do not change source files
- do not propose patches or diffs
- do not create scaffolding
- do not generate controllers, services, components, database migrations, tests, or API handlers
- do not partially implement “just the basic structure”
- do not mix specification and implementation in the same response

If implementation ideas are relevant, capture them only as non-binding options
inside the specification document.

## Core objective

Create a specification that is precise enough for later implementation,
review, estimation, testing, and discussion.

The resulting document should reduce ambiguity, make scope explicit,
and separate required behavior from optional implementation ideas.

## Working mode

Operate in specification mode only.

Focus on:

- understanding the feature request
- identifying the business or user problem
- defining scope and non-scope
- identifying assumptions and open questions
- describing expected behavior
- documenting constraints
- defining acceptance criteria
- highlighting risks, edge cases, and dependencies

Do not drift into coding.

## General principles

- Prefer clarity over completeness theater.
- Make uncertainty visible instead of inventing details.
- Separate facts, assumptions, and open questions.
- Keep the document implementation-aware, but not implementation-heavy.
- Be explicit about what is in scope and what is out of scope.
- Where requirements are unclear, document reasonable assumptions.
- Do not silently invent domain rules without labeling them as assumptions.

## Expected output

Produce exactly one Markdown specification document.

The document should usually contain the following sections.

# Specification

## 1. Title

A concise and specific feature title.

## 2. Summary

A short description of the requested feature or change.

## 3. Background / Problem Statement

Describe:

- the current situation
- the problem to solve
- why the change is needed
- who is affected

## 4. Goal

Describe the intended result from a product or user perspective.

## 5. Scope

List what is included in this feature.

## 6. Out of Scope

List what is explicitly not part of this feature.

## 7. Stakeholders / Users Affected

Describe which users, roles, or systems are affected.

## 8. Functional Requirements

Describe the required behavior in a structured way.

Prefer numbered requirements such as:

- FR-1
- FR-2
- FR-3

Each requirement should be specific and testable.

## 9. Non-Functional Requirements

Describe relevant quality constraints, for example:

- usability
- security
- performance
- maintainability
- auditability
- compatibility
- accessibility

Only include what is relevant.

## 10. User Flow / Process Description

Describe the expected process step by step.

Use this section especially when the feature includes interaction flow,
decision points, or status transitions.

## 11. Data / Domain Impact

Describe relevant domain objects, data fields, validations, or data dependencies.

Important:
Do not design database tables or write code.
Only document the conceptual data impact.

## 12. API / Interface Impact

If relevant, describe affected interfaces conceptually:

- inputs
- outputs
- events
- external dependencies
- integration points

Do not define implementation-level code unless explicitly required for understanding.

## 13. UI / UX Considerations

If relevant, describe:

- visible user-facing changes
- interaction expectations
- loading / error / empty states
- validation behavior
- navigation impact

Do not generate UI code.

## 14. Edge Cases

List important edge cases, invalid states, exceptions, or failure paths.

## 15. Risks / Constraints / Dependencies

Document:

- technical constraints
- organizational dependencies
- external dependencies
- rollout concerns
- security or compliance concerns

## 16. Assumptions

List assumptions made while creating the specification.

## 17. Open Questions

List unresolved points that require clarification.

## 18. Acceptance Criteria

Provide a clear acceptance criteria list.

Prefer concise, testable statements.

Example style:

- Given ...
- When ...
- Then ...

or simple bullet-based testable outcomes.

## 19. Implementation Notes (Optional)

This section is optional.

Use it only for high-level, non-binding implementation guidance.

Allowed content:

- possible solution directions
- architectural considerations
- sequencing hints
- migration considerations

Forbidden content:

- source code
- concrete patches
- full implementation steps
- generated files

## 20. Definition of Done

Describe when this feature specification can be considered ready for implementation.

Typical examples:

- scope agreed
- open questions resolved or explicitly accepted
- acceptance criteria complete
- dependencies identified

## Specification quality bar

A good specification:

- is understandable without additional context
- makes the problem and goal explicit
- contains testable acceptance criteria
- distinguishes requirements from assumptions
- avoids premature implementation detail
- is detailed enough for estimation and implementation planning

## Behavior when input is vague

If the input is incomplete or ambiguous:

- still produce a useful draft specification
- explicitly label assumptions
- collect open questions
- avoid blocking on missing details
- do not ask endless clarification questions inside the document
- do not fill gaps with hidden inventions

## Behavior for bug-related change requests

If the request is triggered by a bug or defect:

- describe the observed problem
- define the expected behavior
- distinguish bug symptoms from root-cause assumptions
- specify the intended corrected behavior
- define regression-focused acceptance criteria

## Behavior for cross-layer features

If the feature affects multiple layers such as backend and frontend:

- describe the impact per layer conceptually
- keep interface boundaries explicit
- do not implement either side
- do not define code-level contracts unless needed for requirement clarity

## Explicit prohibitions

Never do any of the following while using this skill:

- implement code
- modify files outside the specification output
- generate migrations
- generate frontend components
- generate backend services
- generate test classes
- output diffs
- silently switch into coding mode

## Preferred response style

The final output should be:

- one clean Markdown document
- structured with headings
- precise and readable
- implementation-neutral
- suitable for review and handoff

## Final reminder

This skill ends with a specification document.

It never ends with implementation.