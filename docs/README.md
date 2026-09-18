# TravelBuddy Mock — Finish Docs

Self-serve guide to finish this Vue click-through mock **before** the Laravel submission. No backend, no real auth, no real email/Telegram.

## Mock vs Laravel

| Artifact | Where | Role |
|---|---|---|
| **This Vue mock** | This repo (`BuildersTable---build`, package name `mock`) | Click-through UX prototype. Frontend-only. |
| **Laravel submission** | Separate app (not inside this repo) | Final hackathon product with Breeze auth + Eloquent. Spec lives in the vault (`TravelBuddy/02-Product/v1-scope.md`). |

Use these docs to finish the mock. Do **not** treat this app as the submission codebase.

## UX reference

Trip-detail interaction density inspired by:

https://travelbuddy-1.ai.studio/curator/trip/trip-1

Keep **this repo’s routes and design themes** (see [04-design-themes.md](./04-design-themes.md)). The reference’s `/curator/...` paths are inspiration only.

## Product loop (richer)

Curator manages itinerary → assigns travelers → notifies (simulated) → traveler opens share link → confirm/decline → curator sees rollup. Full flows: [02-user-flows.md](./02-user-flows.md).

## How to use this set

1. Read [01-mock-finish-plan.md](./01-mock-finish-plan.md) for phases and success criteria.
2. Skim [02-user-flows.md](./02-user-flows.md) and [03-screens-and-components.md](./03-screens-and-components.md) before coding screens.
3. Lock visuals with [04-design-themes.md](./04-design-themes.md).
4. Extend data/state per [05-mock-data-and-state.md](./05-mock-data-and-state.md).
5. Work through [06-build-checklist.md](./06-build-checklist.md).
6. Rehearse the pitch walkthrough with [07-demo-path.md](./07-demo-path.md).
7. Next UX iteration backlog: [08-mock-feedback.md](./08-mock-feedback.md).

## Doc index

| Doc | Contents |
|---|---|
| [01-mock-finish-plan.md](./01-mock-finish-plan.md) | Phased build order, success criteria, out of scope |
| [02-user-flows.md](./02-user-flows.md) | Curator + traveler flows (mermaid) |
| [03-screens-and-components.md](./03-screens-and-components.md) | Screen specs + component inventory |
| [04-design-themes.md](./04-design-themes.md) | Tokens, layout, badges, motion |
| [05-mock-data-and-state.md](./05-mock-data-and-state.md) | Types, seed rules, in-memory store |
| [06-build-checklist.md](./06-build-checklist.md) | Checkbox implementation order |
| [07-demo-path.md](./07-demo-path.md) | Pitch rehearsal walkthrough |
| [08-mock-feedback.md](./08-mock-feedback.md) | Post-baseline UX feedback to implement next |

## Baseline today

- **Built:** full mock loop — dashboard, trip detail (itinerary/travelers/notify), traveler share view
- **Legacy overview:** root [`PROJECT_SUMMARY.md`](../PROJECT_SUMMARY.md) — superseded for finish work by this folder when they conflict
