# Five-axis review rubric

Adapted from `addyosmani/agent-skills` (`skills/code-review-and-quality`, MIT) and used with the
repository's boundaries from `AGENTS.md`. The source rubric is generic; this file keeps the parts an
audit of this storefront needs.

Source: https://github.com/addyosmani/agent-skills/blob/8c99fa36d90068c82d547f7c12a9d67a3e95f4ee/skills/code-review-and-quality/SKILL.md

## The approval standard

Approve a change when it definitely improves overall code health, even if it is not perfect. The goal
is continuous improvement, not a rewrite. Do not block a change because it is not exactly how you
would have written it. If it improves the codebase and follows the project's conventions, it passes.

## The five axes

### 1. Correctness

- Does the code do what it claims to do?
- Are null, empty, boundary, and error cases handled?
- Do the tests test behavior rather than implementation details?
- Are there race conditions, stale state, or cache-key collisions?
- Does the change survive a cold request, a reload, and a back navigation?

### 2. Readability and simplicity

- Can another engineer understand the code without the author explaining it?
- Are names descriptive and consistent with the repository?
- Is the control flow straightforward, without nested ternaries or deep callbacks?
- Is the code organized by owner and execution context?
- Could the same result be produced with fewer moving parts?
- Are abstractions earning their complexity?
- Is there dead code, a pass-through wrapper, or a comment that narrates the code?
- Is a new conditional bolted onto an unrelated flow? That is a design smell, not a nit.
- Do repeated conditionals on the same shape signal a missing type or dispatcher?

### 3. Architecture

- Does the change follow existing patterns or introduce a new one? If new, is it justified?
- Are module boundaries clean, with dependencies flowing in one direction?
- Is feature-specific logic leaking into a shared or general-purpose module?
- Is a new dependency solving a problem the existing stack already solves?
- Does the refactor reduce complexity or just relocate it?
- Are type boundaries explicit, or do `any`, `unknown`, optional fields, and silent fallbacks hide
  an unclear invariant?
- Does the change stay inside its owner: Shopify commerce, Next.js app, or Eve agent?

### 4. Security

- Is user input validated and sanitized at the boundary?
- Are secrets kept out of code, logs, client bundles, and version control?
- Are authentication and authorization checked where needed?
- Are dynamic values escaped or sanitized before HTML rendering?
- Are external data sources treated as untrusted?
- Are redirects constrained to same-origin or an allowlist?

### 5. Performance

- Are there N+1 fetches, sequential awaits, or unbounded loops?
- Is Shopify data fetched more than once per request?
- Are large objects serialized into client components?
- Are images sized, lazy below the fold, and prioritized only for the LCP element?
- Are client components, listeners, and third-party scripts kept off the critical path?
- Has the cost been measured, or is the finding speculative?

## Structural remedies

When a structural problem is real, propose the move rather than only the symptom:

- replace a chain of conditionals with a typed model or explicit dispatcher;
- collapse duplicate branches into one flow;
- separate orchestration from business logic;
- move feature-specific logic into the owner that names the concept;
- reuse the canonical helper instead of a near-duplicate;
- make a type boundary explicit so downstream branching disappears;
- delete a pass-through wrapper that adds indirection without clarifying the API;
- extract a helper or split a large file into focused modules.

Prefer the remedy that removes moving pieces over one that spreads the same complexity around.

## Severity labels

| Label          | Meaning                                                  | Author action             |
| -------------- | -------------------------------------------------------- | ------------------------- |
| **Critical**   | Blocks release: security, data loss, broken functionality | Must fix                  |
| **Major**      | Real defect or broken contract with a workaround          | Should fix                |
| **Minor**      | Degraded quality, limited blast radius                    | May fix                   |
| **Nit**        | Formatting or preference                                  | Author may ignore         |
| **Optional**   | Worth considering, not required                           | No action required        |
| **FYI**        | Context for future work                                   | No action required        |

Lead with what matters. Order by leverage: correctness and security first, then structural
regressions, then performance, then everything else. One structural problem and ten nits is one
review, and the structural problem is the review.

## Review process

1. Understand the intent: what is the change trying to accomplish, and what behavior should change?
2. Review the tests first: do they test behavior, cover edge cases, and fail when the implementation
   is inverted?
3. Walk each changed file through the five axes.
4. Check the verification story: which commands ran, which routes or viewports were exercised, and
   what remains unverified.
5. Label every finding with a severity and a file:line reference.
6. Separate pre-existing defects from regressions introduced by the change.
7. State the verdict: approve, request changes, or reject. Do not rubber-stamp.

## Honesty

- Do not soften a real issue. Say it directly and propose an alternative.
- Quantify when possible: which request, which token, which viewport, which measured value.
- Comment on code, not people.
- If the author has full context and disagrees, defer to their judgment once the evidence is clear.
- A clean review is a valid outcome. Do not manufacture findings.
