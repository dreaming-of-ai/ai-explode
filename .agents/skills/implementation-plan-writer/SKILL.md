---
name: implementation-plan-writer
description: >
  Use when a completed feature specification already exists and the next step
  is to transform it into a structured implementation plan. This task is
  strictly planning only. Never implement code.
triggers:
  - create implementation plan
  - implementation planning
  - plan feature implementation
  - derive tasks from spec
  - break down specification
  - technical implementation plan
  - rollout plan
  - implementation roadmap
---

# SKILL: Implementation Plan Writer

## Purpose

Use this skill when a feature specification already exists and must now be
translated into a structured implementation plan.

The output of this skill is always a Markdown implementation plan document.

This skill is strictly limited to planning, decomposition, sequencing,
risk identification, and delivery preparation.

It must never produce implementation.

---

## Hard rule

During this task, never implement anything.

This means in particular:

- do not write production code
- do not modify source files
- do not generate patches or diffs
- do not create scaffolding
- do not generate migrations
- do not create components, services, controllers, endpoints, tests, or scripts
- do not output pseudo-implementation disguised as a plan
- do not mix planning and coding in the same response

If technical direction is needed, describe it only at planning level.

---

## Core objective

Transform a specification into a realistic, structured, reviewable
implementation plan that can guide later execution.

The plan should:

- break the work into logical increments
- make dependencies and sequencing explicit
- identify affected areas
- define implementation work packages
- highlight risks and unknowns
- support estimation and assignment
- remain strictly non-coding

---

## Working mode

Operate in planning mode only.

Focus on:

- understanding the specification
- identifying implementation workstreams
- separating phases and dependencies
- defining tasks and subtasks
- identifying technical decisions
- documenting validation and rollout needs
- surfacing risks, assumptions, and blockers

Do not drift into solution implementation.

---

## General principles

- Plan in enough detail to support execution, but not at code level.
- Prefer clear work packages over vague activity lists.
- Separate mandatory work from optional improvements.
- Make sequencing explicit.
- Surface uncertainties instead of hiding them.
- Distinguish known facts from assumptions.
- Keep the plan implementation-oriented, but not implementation-level.

---

## Input expectation

This skill assumes that a specification already exists.

If the specification is incomplete, inconsistent, or ambiguous:

- still produce a useful draft implementation plan
- explicitly list assumptions
- explicitly identify open questions and blockers
- avoid inventing hidden requirements

---

## Expected output

Produce exactly one Markdown implementation plan document.

The document should usually contain the following sections.

# Implementation Plan

## 1. Title

A concise implementation plan title based on the feature specification.

## 2. Summary

A short summary of what is to be implemented and what this plan covers.

## 3. Source Specification

Reference the underlying specification by name or feature title.

If no formal title exists, provide a short identifier.

## 4. Planning Goals

Describe what this plan is intended to achieve, for example:

- clear execution structure
- sequencing
- dependency visibility
- task breakdown
- delivery readiness

## 5. Scope of This Plan

Describe what implementation work is covered by this plan.

## 6. Out of Scope

Describe what is not covered by this plan.

Examples:

- future enhancements
- unrelated refactorings
- platform migration
- post-MVP optimizations

## 7. Affected Areas

List the relevant solution areas at a planning level.

Examples:

- backend
- frontend
- API contracts
- database / persistence
- authentication / authorization
- validation
- UI / UX
- logging / monitoring
- testing
- deployment / rollout
- documentation

Do not write code or file diffs.

## 8. Workstreams

Break the work into major workstreams.

Typical examples:

- domain and backend changes
- API contract changes
- frontend integration
- test adaptation
- operational readiness

Each workstream should describe:

- purpose
- main responsibilities
- dependencies
- major risks

## 9. Phased Execution Plan

Break the implementation into ordered phases.

Example phase types:

- Phase 1: clarification / technical preparation
- Phase 2: backend foundation
- Phase 3: API and contract alignment
- Phase 4: frontend integration
- Phase 5: validation and hardening
- Phase 6: rollout preparation

For each phase, describe:

- objective
- key tasks
- dependencies
- entry criteria
- exit criteria

## 10. Task Breakdown

Provide a structured breakdown of tasks.

Use identifiers such as:

- T1
- T1.1
- T1.2
- T2

Each task should include:

- title
- description
- purpose
- dependencies
- affected area
- notes or risks

Tasks must be concrete enough to execute later, but must not contain code.

## 11. Dependency Map

Describe important dependencies between tasks or workstreams.

Examples:

- backend contract must exist before frontend integration
- authorization model must be clarified before endpoint work
- data model decisions must be finalized before migration planning

This section should make sequencing constraints visible.

## 12. Technical Decision Points

List important decisions that must be made before or during implementation.

Examples:

- API shape decisions
- validation responsibility boundaries
- migration strategy
- backward compatibility handling
- error handling model
- rollout strategy

For each decision point, describe:

- decision topic
- why it matters
- possible options at a high level
- impact of delaying the decision

Do not resolve these through code.

## 13. Risks and Complexity Drivers

Identify implementation risks such as:

- unclear requirements
- cross-layer dependencies
- data migration concerns
- security impact
- performance implications
- regression risk
- rollout complexity
- coordination effort

Where possible, describe mitigation ideas at planning level.

## 14. Assumptions

List assumptions the plan currently relies on.

## 15. Open Questions / Blockers

List unresolved issues that could affect execution.

Mark clearly whether something is:

- an open question
- a blocker
- a nice-to-clarify point

## 16. Testing and Validation Plan

Describe what kinds of validation will be required later.

Examples:

- unit tests
- integration tests
- API tests
- UI tests
- regression tests
- manual exploratory checks
- security validation
- performance validation

Important:
Only describe validation planning.
Do not generate tests.

## 17. Rollout / Release Considerations

If relevant, describe:

- feature flags
- incremental rollout
- backward compatibility
- migration sequencing
- communication needs
- fallback / rollback considerations

Keep this conceptual.

## 18. Documentation Impact

Describe what documentation may need updates later, such as:

- API docs
- admin docs
- user guides
- operational docs
- release notes

## 19. Suggested Delivery Slices

Where useful, group work into delivery slices such as:

- MVP
- follow-up hardening
- optional enhancements

This should help phased delivery without changing the specification itself.

## 20. Implementation Readiness Checklist

Provide a checklist describing when the feature is ready to enter implementation.

Typical examples:

- specification accepted
- open blockers resolved
- major decision points clarified
- dependencies identified
- task breakdown reviewed
- rollout approach aligned

## 21. Definition of Done for Planning

Describe when this implementation plan itself is considered complete.

Typical examples:

- workstreams identified
- phases defined
- tasks broken down
- risks documented
- blockers visible
- validation approach outlined

---

## Planning quality bar

A good implementation plan:

- is based on the specification
- is structured and sequenced
- exposes dependencies clearly
- provides actionable work packages
- avoids coding detail
- supports estimation and assignment
- makes uncertainty visible
- can be used directly in delivery planning

---

## Behavior for cross-layer features

If the feature affects multiple layers such as backend and frontend:

- separate work clearly by layer
- make API and contract dependencies explicit
- identify sequencing constraints
- keep ownership boundaries visible
- do not mix planning with implementation

---

## Behavior for bug-fix related features

If the plan is based on a bug-related specification:

- separate corrective work from preventive work
- include regression prevention tasks
- identify validation focus areas
- consider rollout sensitivity if the bug is high-risk

---

## Behavior when the specification is weak

If the underlying specification is incomplete:

- still produce a draft implementation plan
- label assumptions clearly
- identify the missing parts
- mark blockers explicitly
- do not compensate by inventing implementation details as facts

---

## Explicit prohibitions

Never do any of the following while using this skill:

- implement source code
- modify repository files other than the plan output
- generate SQL or migrations
- generate backend classes or frontend components
- create tests
- create diffs
- output code snippets as part of the plan
- silently switch from planning into implementation

---

## Preferred response style

The final output should be:

- one clean Markdown document
- clearly structured
- sequenced and actionable
- implementation-oriented but non-coding
- suitable for handoff into delivery planning

---

## Final reminder

This skill ends with an implementation plan document.

It never ends with code.