# TDD Plan Output Format

Shared format for TDD implementation plans. Both writing-tdd-plans and debating-tdd-plans produce plans in this format, compatible with executing-tdd-plans.

## Quick Reference: Required Fields Per Task

| Field | RED | GREEN | REVIEW |
|-------|-----|-------|--------|
| **Type** | RED (Test Writing) | GREEN (Implementation) | REVIEW (Adversarial) |
| **Depends on** | Previous feature's REVIEW, or none | Same feature's RED | Same feature's GREEN |
| **Design requirements** | Verbatim from design | Reference RED task | Verbatim from design |
| **Files** | Exact paths to create | Exact paths to create/modify | Files to review |
| **Code** | Complete test code | Complete implementation | Review checklist + min 3 new tests |
| **Verification** | Command + "ALL tests FAIL" | Command + "ALL tests PASS" | Verdict: PASS/FAIL |
| **Commit** | `test: add failing tests for [feature]` | `feat: implement [feature]` | `test: add adversarial tests for [feature]` |

## Incremental Commits Are Mandatory

Every task ends with a git commit. The plan must specify the commit message:

- **RED:** `git commit -m "test: add failing tests for [feature]"`
- **GREEN:** `git commit -m "feat: implement [feature]"`
- **REVIEW:** `git commit -m "test: add adversarial tests for [feature]"`

## Detail Level

**A plan that summarizes what to do instead of specifying what to build is too short.**

- Include **complete code** (test functions, implementation, classes) — not "write a test that verifies X"
- Specify **exact file paths** — not "create a test file for the feature"
- Include **verification commands** with expected outcomes — not "run the tests"
- Quote **design requirements verbatim** in each task — don't reference the design doc

## Save Location

**Small plans (3 or fewer feature triplets):** Single file in the same directory as the design file, with `-implementation` appended. Example: `docs/design.md` → `docs/design-implementation.md`.

**Large plans (4+ feature triplets):** Split into a subfolder under `docs/plans/`:

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

**Multiple PRs:** Apply the size rule independently per PR — a PR with ≤3 features gets a single file, a PR with 4+ gets a subfolder. Each plan must be self-contained and independently executable.

- Single file: `{design-basename}-implementation-{pr-descriptor}.md`
- Subfolder: `docs/plans/{plan-name}-{pr-descriptor}/`

## Header Template

**Single-file plan:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Execute this plan using subagents. Dispatch a fresh subagent per task
> using the Task tool (subagent_type: "general-purpose"). Each task is self-contained.
> NEVER skip test or review tasks. They are tracked separately and all must complete.

**Goal:** [One sentence from design]

**Architecture:** [2-3 sentences from design]

**Tech Stack:** [Key technologies/libraries]

**Design Document:** [path/to/design.md]

---
```

**Multi-file plan (README.md):**

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

**What to test:**

[Complete test code covering all requirements listed above. Tests MUST fail
because the implementation doesn't exist yet.]

```python
def test_requirement_a():
    """[Requirement A verbatim from design]"""
    result = feature_function(input)
    assert result == expected

def test_edge_case_x():
    """[Edge case X from design]"""
    ...
```

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

**Implementation:**

[Complete implementation code. Minimal — just enough to pass the tests.]

```python
def feature_function(input):
    # Implementation that satisfies test requirements
    ...
```

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

After all feature triplets pass, add one final triplet for end-to-end integration:
- **N.1:** Write integration tests that exercise multiple features together
- **N.2:** Fix any integration failures (may be a no-op if everything works)
- **N.3:** Final adversarial review against ALL design requirements as a checklist

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
- Independent triplets MAY run in parallel if they touch different files
- Dependent triplets are sequential: complete triplet N before starting triplet M

**Never:**
- Skip a test-writing task (N.1) — "I'll write tests with the implementation"
- Skip an adversarial review task (N.3) — "The tests already pass, it's fine"
- Combine tasks within a triplet — each is a separate subagent dispatch
- Proceed to N.2 if N.1 tests don't compile/exist
- Proceed to N.3 if N.2 tests don't pass
- Proceed to next triplet if N.3 verdict is FAIL
```
