# TDD Plan Output Format

Shared format for TDD implementation plans. Both writing-tdd-plans and debating-tdd-plans produce plans in this format, compatible with executing-tdd-plans.

## Quick Reference: Required Fields Per Task

| Field | RED | GREEN | REVIEW |
|-------|-----|-------|--------|
| **Type** | RED (Test Writing) | GREEN (Implementation) | REVIEW (Adversarial) |
| **Depends on** | Previous feature's REVIEW, or none (also serialize if file overlap with parallel features) | Same feature's RED | Same feature's GREEN |
| **Design requirements** | Verbatim from design | Reference RED task | Verbatim from design |
| **Files** | Exact paths to create | Exact paths to create/modify | Files to review |
| **Spec** | Test cases table + key assertions | Implementation spec (what to build, behaviors, API) | Review checklist + tests for any gaps found |
| **Verification** | Command + "ALL tests FAIL" | Command + "ALL tests PASS" | Verdict: PASS/FAIL |
| **Commit** | `test: add failing tests for [feature]` | `feat: implement [feature]` | `test: add adversarial tests for [feature]` |

## Incremental Commits Are Mandatory

Every task ends with a git commit. The plan must specify the commit message:

- **RED:** `git commit -m "test: add failing tests for [feature]"`
- **GREEN:** `git commit -m "feat: implement [feature]"`
- **REVIEW:** `git commit -m "test: add adversarial tests for [feature]"`

## Detail Level

**A plan that vaguely summarizes what to do is too short. A plan that pre-writes the full code is too verbose.**

The sweet spot: detailed specifications that tell the executor exactly WHAT to build, without writing the code for them. The executor (a capable subagent) writes the actual code from the spec.

**Too short:** "Write tests for the delete endpoint" (no specifics)
**Too verbose:** Full function bodies with fixtures, setup, complete assertions
**Just right:** Test case table with scenario + expected behavior per test, key assertions to check, setup notes

- Specify **what to test**: test names, scenario, expected behavior — not full test function bodies
- Specify **what to implement**: functions/classes, signatures, behaviors, constraints — not full implementation code
- Specify **exact file paths** — not "create a test file for the feature"
- Include **verification commands** with expected outcomes — not "run the tests"
- Quote **design requirements verbatim** in each task — don't reference the design doc
- Include **key assertions/edge cases** the executor must not miss — not every assertion line

## Save Location

**Always use multi-file format** — save as a subfolder under `docs/plans/`, regardless of plan size:

```
docs/plans/{plan-name}/
  README.md                    # Header, dependency graph, file index, execution instructions
  task-0-scaffolding.md        # Task 0 (if present)
  feature-1-{name}.md          # Triplet 1: RED/GREEN/REVIEW
  feature-2-{name}.md          # Triplet 2: RED/GREEN/REVIEW
  ...
  integration.md               # Integration triplet
```

Each feature file contains the complete triplet (N.1 RED, N.2 GREEN, N.3 REVIEW) for that feature. The README.md contains the plan header, a file index table mapping each file to its feature and dependencies, the dependency graph, and execution instructions.

**README.md file index table:**

```markdown
## Plan Files

| File | Feature | Depends On |
|------|---------|------------|
| task-0-scaffolding.md | Project scaffolding | None |
| feature-1-auth.md | Authentication | Task 0 |
| feature-2-users.md | User Management | Task 0 |
| integration.md | End-to-end integration | All features |
```

**Multiple PRs:** Each PR gets its own numbered subfolder: `docs/plans/{NN}-{plan-name}-{pr-descriptor}/` where `{NN}` is the zero-padded PR number (01, 02, ...). The number indicates execution order — PRs must be executed in numerical sequence. Each plan must be self-contained and independently executable.

## Header Template (README.md)

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** This plan is split across multiple files. Read this README for the
> dependency graph and execution order, then read individual feature files for task details.
> Dispatch a fresh subagent per task using the Task tool (subagent_type: "general-purpose").

**Goal:** [One sentence from design]

**Architecture:** [2-3 sentences from design]

**Tech Stack:** [Key technologies/libraries]

**Design Document:** [path/to/design.md]

## Plan Files

| File | Feature | Depends On |
|------|---------|------------|
| ... | ... | ... |

---
```

## Triplet Templates

For each feature/component identified in the design:

### Task N.1 — Write Failing Tests (RED)

```markdown
### Task N.1: Write failing tests for [Feature Name]

**Type:** RED (Test Writing)
**Dispatch as:** Fresh subagent via Task tool
**Depends on:** [previous feature's Task M.3, or none if first]

**Design requirements being tested:**
- [Requirement A from design doc]
- [Requirement B from design doc]
- [Edge case X from design doc]

**Files:**
- Create: `tests/exact/path/to/test_feature.py`

**Test cases:**

| Test | Scenario | Expected |
|------|----------|----------|
| test_requirement_a | [Setup/input] | [Expected outcome. Verifies: Requirement A] |
| test_requirement_b | [Setup/input] | [Expected outcome. Verifies: Requirement B] |
| test_edge_case_x | [Edge input] | [Expected behavior. Verifies: Edge case X] |

**Setup:** [Fixtures or test data needed — describe what, not how]

**Key assertions:** [Non-obvious assertions the executor must include, e.g., "soft-delete means record stays in DB with deleted_at set"]

**UI deliverable rule:** If the feature creates a UI component (page, modal, widget, settings panel), at least one test MUST verify the component **renders** — not just that store actions dispatch or services resolve from DI. Store/action tests can pass without the component file existing. The GREEN step (YAGNI) will only create what tests require, so a feature with only state management tests produces only state management code — no component. Include a rendering test (e.g., bUnit, React Testing Library) that imports and renders the component.

**Verification:**
Run: `[exact test command]`
Expected: ALL tests FAIL (function/module not found)

**Commit:** `git commit -m "test: add failing tests for [feature]"`
```

### Task N.2 — Implement to Pass Tests (GREEN)

```markdown
### Task N.2: Implement [Feature Name]

**Type:** GREEN (Implementation)
**Dispatch as:** Fresh subagent via Task tool
**Depends on:** Task N.1 must be complete (failing tests must exist)

**Goal:** Write the minimal code to make ALL tests from Task N.1 pass.
Do NOT add functionality beyond what the tests require. YAGNI.

**Files:**
- Create/Modify: `src/exact/path/to/feature.py`
- Reference: `tests/exact/path/to/test_feature.py` (already exists from N.1)

**What to implement:**

- [Function/class to create, its signature, and key behavior]
- [How it connects to existing code — imports, integrations]
- [Constraints: what it must/must not do]
- [Any non-obvious implementation detail the executor needs to know]

**Verification:**
Run: `[exact test command]`
Expected: ALL tests PASS

**Commit:** `git commit -m "feat: implement [feature]"`
```

### Task N.3 — Adversarial Review

```markdown
### Task N.3: Adversarial review of [Feature Name]

**Type:** REVIEW (Adversarial)
**Dispatch as:** Fresh subagent via Task tool
**Depends on:** Task N.2 must be complete (implementation must exist and tests pass)

**Your role:** You are an adversarial reviewer with TWO equally important jobs:
1. **Verify requirements** — confirm the implementation actually delivers what was
   specified. Bug-free code that doesn't follow the requirements is a FAIL.
2. **Break it** — find bugs, edge cases, and gaps. Assume the implementation is wrong
   until proven otherwise.

**Design requirements to verify:**
- [Requirement A from design doc — verbatim]
- [Requirement B from design doc — verbatim]
- [Edge case X from design doc — verbatim]

**Review checklist:**

**Requirements verification (does it do what was asked?):**

1. **Requirements compliance** — Read the implementation and compare against EACH
   requirement listed above. Treat requirements as a checklist: each one must map to
   actual code. Is anything missing? Misinterpreted? Partially implemented? Over-built?
   A bug-free implementation that doesn't match the requirements is a FAIL.

2. **Completeness** — Are ALL required features present and working as specified?
   Does any requirement lack corresponding implementation?

**Breaking the implementation (does it work correctly?):**

3. **Test adequacy** — Do the tests actually test what they claim? Could the tests pass
   with a WRONG implementation? If yes, write additional tests that expose gaps.

4. **Edge cases** — Try to break it. Think of inputs the tests don't cover.
   If you find uncovered cases, write tests for them and run them.

5. **Error handling** — What happens with invalid input? Null? Empty? Huge? Concurrent?

6. **Integration** — Does it work with the rest of the system? Any assumptions that
   could break when connected to real code?

**You MUST actively try to break the implementation and find gaps.** If you find coverage
gaps, edge cases, or ways the existing tests could pass with a wrong implementation,
you MUST write and run additional tests targeting those gaps. If the existing tests are
comprehensive and you find no gaps after thorough analysis, you may skip writing tests
— but you must explain why the existing coverage is sufficient.

**What to produce:**
- List of issues found (Critical / Important / Minor)
- Additional tests written and their results (if gaps were found)
- If no tests written: explanation of why existing coverage is sufficient
- Verdict: PASS (all requirements implemented correctly, no critical/important issues)
  or FAIL (requirements missing/misimplemented OR critical/important bugs found)

**If FAIL:** Create fix tasks (following same triplet: test the fix, implement fix,
re-review). Append them to the plan.

**If additional tests written:** `git commit -m "test: add adversarial tests for [feature]"`
```

## Special Task Types

### Task 0 — Scaffolding (optional)

If features share infrastructure (database setup, config, project structure, dependency installation), create a **Task 0** before any triplets. This is the only task that doesn't follow the triplet pattern. Keep it minimal — just enough for the first triplet to run.

### Integration Triplet (final)

After all feature triplets pass, add one final triplet for end-to-end integration.

**Why this matters:** Feature triplets test components in isolation with mocks. Every mock is a lie — it asserts two components work together without proving it. The integration triplet verifies what mocks hide.

**The Mock Trap:** When every feature is tested with mocks, all feature tests pass even when:
- A service is registered in DI but the implementation is a stub (`NotImplementedException`)
- A decorator/middleware exists in code but is never applied to the pipeline
- A project reference is missing so the app can't compile with its real dependencies
- A DI registration is missing so the app crashes at startup resolving a service

**The integration triplet MUST cover these categories:**

1. **Startup/DI verification** — Can each application/host actually start and resolve all registered services? Build the real DI container (or start the real app) and verify key interfaces resolve to real implementations (not stubs). This catches: missing DI registrations, missing project references, misconfigured service lifetimes, stub implementations that survived mock-based feature testing.

2. **Mock boundary verification** — Every mock used in a feature test represents a real connection that was NOT tested. For each mock used in feature tests, the integration test must exercise the REAL connection. Example: if Feature A mocked `ITokenExchangeService`, integration must test the real `MsalTokenExchangeService` in the actual OAuth callback flow.

3. **Pipeline/middleware hookup** — Decorators, middleware, filters, and interceptors tested in isolation must be verified as actually applied in the real pipeline. Example: if a feature tested `TokenInjectingMcpTool` as a standalone decorator, integration must verify it's actually wrapping tool calls in the real pipeline.

4. **End-to-end data flows** — Trace each primary user-facing flow from entry point to final effect, using real implementations for internal components. Only mock truly external services (third-party APIs with no local alternative).

**To build the integration task list, create a Mock Boundary Table** during planning. For every feature, list each mock used and what real connection it hides. Each row becomes an integration test requirement:

| Feature | Mock Used | Real Connection Hidden | Integration Test |
|---------|-----------|----------------------|-----------------|
| *Example:* F2 (MCP Tools) | `Mock<ICalendarProvider>` | MCP server DI can't resolve real provider | Start MCP server, resolve `ICalendarProvider` |
| *Example:* F1 (Decorator) | Tested decorator standalone | Decorator isn't applied in pipeline | Make real MCP call, verify decorator intercepts |
| *Example:* F7 (OAuth) | `Mock<ITokenExchangeService>` | Real MSAL impl is a stub | Real OAuth callback exchanges code for tokens |

**Template:**
- **N.1:** Write integration tests covering all four categories. Include the Mock Boundary Table in the task spec listing every mock from feature tests and the corresponding real-connection test.
- **N.2:** Fix integration failures. Expect: missing DI registrations, project references, stub replacements, pipeline hook-ups. This is often NOT a no-op.
- **N.3:** Final adversarial review against ALL design requirements as a checklist, plus full build and full test suite verification across ALL features.

## Execution Instructions

The plan must include this section after the tasks:

```markdown
## Execution Instructions

**Recommended:** Execute using subagents for fresh context per task.

For each task, dispatch a fresh subagent using the Task tool:
- subagent_type: "general-purpose"
- Provide the FULL task text in the prompt (don't make subagent read this file)
- Include relevant context from earlier tasks (what was built, where files are)

**Execution order:**
- Tasks within a triplet are strictly sequential: N.1 → N.2 → N.3
- Independent triplets MAY run in parallel ONLY if they have zero file overlap (no shared created/modified files)
- Dependent triplets are sequential: complete triplet N before starting triplet M
- If the dependency graph says two features are parallel, they MUST NOT modify any overlapping files — this was verified during planning

**Never:**
- Skip a test-writing task (N.1) — "I'll write tests with the implementation"
- Skip an adversarial review task (N.3) — "The tests already pass, it's fine"
- Combine tasks within a triplet — each is a separate subagent dispatch
- Proceed to N.2 if N.1 tests don't compile/exist
- Proceed to N.3 if N.2 tests don't pass
- Proceed to next triplet if N.3 verdict is FAIL
```
