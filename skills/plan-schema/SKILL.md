---
name: plan-schema
description: Plan file (docs/plans/*-plan.md) reference — sections, per-file format, dependency graph, and converter mappings
allowed-tools: Bash, Read, Write, Edit
argument-hint: "[validate <path>]"
---

Plan file schema reference for architectural plans created by `/plan-creator`, `/bug-plan-creator`, and `/code-quality-plan-creator`. Use this when creating, editing, or reviewing `docs/plans/*-plan.md` files.

## When to Use

Invoke `/plan-schema` before manually editing any plan file. Invoke `/plan-schema validate <path>` to check an existing plan.

## Core Concepts

Plans are markdown files in `docs/plans/` that specify HOW to implement a feature, fix, or improvement. They are consumed by:
- `/plan-loop` and `/plan-swarm` — execute plans directly

### Conversion Pipeline

Plans are the intermediate representation between creators and executors:

```
/plan-creator (or /bug-plan-creator, /code-quality-plan-creator)
    ↓ writes
docs/plans/{slug}-{hash5}-plan.md
    ↓ consumed by (choose one)
    └─ /plan-loop or /plan-swarm        → executes plan directly
```

**Direct execution** (`/plan-loop`, `/plan-swarm`) reads the plan file and implements each file entry in dependency order. No intermediate format needed.

### File Naming

```
docs/plans/{slug}-{hash5}-plan.md
```

| Creator | Pattern | Example |
|---------|---------|---------|
| `/plan-creator` | `{feature-slug}-{hash5}-plan.md` | `oauth2-authentication-a3f9e-plan.md` |
| `/bug-plan-creator` | `bug-plan-creator-{identifier}-{hash5}-plan.md` | `bug-plan-creator-auth-null-pointer-4k2m7-plan.md` |
| `/code-quality-plan-creator` | `code-quality-{filename}-{hash5}-plan.md` | `code-quality-auth_service-3m8k5-plan.md` |

Slug: kebab-case, concise. Hash: 5-char lowercase alphanumeric.

## Required Sections

Every plan must have these sections in order:

| Section | Purpose | Converter Use |
|---------|---------|---------------|
| `## Summary` | 2-3 sentence executive summary |
| `## Files` | Canonical list of files to edit/create |
| `## Code Context` | Raw investigation findings with file:line refs |
| `## External Context` | API docs, library references, best practices |
| `## Architectural Narrative` | Architecture, approach, requirements, constraints |
| `## Implementation Plan` | Per-file instructions with full code |
| `## Dependency Graph` | Phase table mapping files to execution order |
| `## Exit Criteria` | Test commands and success conditions |

### Additional Sections by Plan Type

| Plan Type | Extra Sections |
|-----------|---------------|
| Bug plan | `## Error Analysis` (Original Error, Root Cause, Code Path), `## Investigation Findings` (Evidence, Hypothesis Testing, Root Cause Location) |
| Code quality plan | `## LSP Analysis Summary` (Symbols Found, Reference Analysis) |

## Section Details

### Summary

```markdown
## Summary

[2-3 sentence executive summary of what will be built/fixed and why]
```

### Files

```markdown
## Files

> **Note**: This is the canonical file list.

### Files to Edit
- `path/to/existing1`
- `path/to/existing2`

### Files to Create
- `path/to/new1`
- `path/to/new2`
```

### Code Context

```markdown
## Code Context

[Raw findings from codebase investigation - file:line references, patterns, architecture.
 This section preserves investigation notes for converters to copy into task descriptions.]
```

### External Context

```markdown
## External Context

[API references, library documentation, best practices, installation commands.
 "N/A" if no external research was needed.]
```

### Architectural Narrative

Contains these subsections (all required):

| Subsection | Content |
|------------|---------|
| `### Task` | Detailed task description |
| `### Architecture` | Current system architecture with file:line references |
| `### Selected Context` | Relevant files and what they provide |
| `### Relationships` | Component dependencies and data flow |
| `### External Context` | Key documentation findings |
| `### Implementation Notes` | Patterns, edge cases, specific guidance |
| `### Ambiguities` | Open questions or decisions made |
| `### Requirements` | Numbered acceptance criteria — ALL must be satisfied |
| `### Constraints` | Hard technical constraints |
| `### Selected Approach` | Single chosen approach with rationale (see below) |

**Selected Approach format:**

```markdown
### Selected Approach

**Approach**: [Name]
**Description**: [How it will be implemented]
**Rationale**: [Why this is the best approach]
**Trade-offs Accepted**: [Limitations or compromises]
```

Bug plans use `### Fix Strategy` instead of `### Selected Approach` (same format).

### Implementation Plan

Per-file instructions. Each file gets its own subsection:

```markdown
## Implementation Plan

### path/to/file [edit|create]

**Purpose**: [What this file does]
**TOTAL CHANGES**: [N] (exact count)

**Changes**:
1. [Change description with exact line numbers]
2. [Another change with line numbers]

**Implementation Details**:
- Exact function signatures with types
- Import statements needed
- Integration points with other files

**Reference Implementation** (REQUIRED - FULL code):
```language
// COMPLETE implementation — copy-paste ready
// ALL imports, ALL functions, ALL logic
```

**Migration Pattern** (for edits — show before/after):
```language
// BEFORE (current code at line X):
const oldCode = something()

// AFTER (new code):
const newCode = somethingBetter()
```

**Test File**: `path/to/file.test.ext` — Tests to write BEFORE implementation:
- Test: [test name] — Asserts: [expected behavior]
- Test: [test name] — Asserts: [expected behavior]

**Dependencies**: [File paths from this plan that must exist first]
**Provides**: [Exports other plan files depend on]
```

### Dependency Graph

Maps files to phased execution order. Source of truth for converter dependency wiring.

```markdown
## Dependency Graph

> Files in the same phase can execute in parallel.

| Phase | File | Action | Depends On |
|-------|------|--------|------------|
| 1 | `src/types/auth.ts` | create | — |
| 1 | `src/config/oauth.ts` | create | — |
| 2 | `src/services/auth.ts` | create | `src/types/auth.ts`, `src/config/oauth.ts` |
| 3 | `src/routes/auth.ts` | edit | `src/services/auth.ts` |
```

**Rules:**
- Phase 1 = files with no dependencies on other plan files
- Phase N+1 = files whose deps are ALL in phases <= N
- Same phase = parallel (no inter-dependencies)
- Dependency = real code dependency (imports, extends, uses)
- Every file from `## Files` must appear in this table
- **TDD ordering**: Test files MUST appear in earlier phases than the production files they verify. This ensures executors write the failing test (RED) before implementing production code (GREEN). Types/interfaces/config with no business logic are exempt.

### Exit Criteria

```markdown
## Exit Criteria

### Test Commands
```bash
[test-command]        # e.g., npm test, pytest, go test ./...
[lint-command]        # e.g., npm run lint, ruff check
[typecheck-command]   # e.g., npm run typecheck, mypy .
```

### Success Conditions
- [ ] All tests pass (exit code 0)
- [ ] No linting errors (exit code 0)
- [ ] No type errors (exit code 0)
- [ ] All requirements satisfied
- [ ] All files implemented

### Verification Script
```bash
[test-command] && [lint-command] && [typecheck-command]
```
```

## Banned Anti-Patterns

These phrases are forbidden in plans — replace with exact specifications:

```
"add appropriate...", "update the function", "similar to existing code",
"handle edge cases", "add necessary imports", "implement the logic",
"as needed", "etc.", "and so on", "appropriate validation",
"proper error messages", "update accordingly", "follow the pattern",
"use best practices", "optimize as necessary", "refactor if needed",
"TBD/TODO/FIXME"
```

Replace with: exact exceptions, specific line numbers, file:line references, explicit lists, exact import statements, complete signatures with types.

## Validation Checklist

### Structure
- [ ] All required sections exist (Summary, Files, Code Context, External Context, Architectural Narrative, Implementation Plan, Dependency Graph, Exit Criteria)
- [ ] Each per-file entry has: Purpose, Changes (numbered with line numbers), Reference Implementation, Dependencies, Provides

### Dependencies
- [ ] Every per-file `Dependencies` has a matching `Provides` in another file
- [ ] No circular dependencies
- [ ] Interface signatures are identical everywhere they appear
- [ ] Dependency Graph table includes ALL files from `## Files`
- [ ] Phase assignments match per-file Dependencies
- [ ] Phase 1 files have no dependencies on other plan files

### TDD Compliance
- [ ] Every production file with business logic has a corresponding test file
- [ ] Test files appear in earlier dependency graph phases than production files they test
- [ ] Each test file has specific test cases listed (not vague "add tests")

### Consumer Readiness
- [ ] Each file's instructions are implementable without questions
- [ ] All function signatures include full types
- [ ] All imports listed
- [ ] Line numbers provided for edits
- [ ] Full reference implementation code included (not patterns)

### Requirements Coverage
- [ ] Every requirement maps to at least one file change
- [ ] No requirements are orphaned

## Instructions

Parse `$ARGUMENTS` to determine mode.

### If `$ARGUMENTS` starts with `validate`:

Extract the path from `$ARGUMENTS` (e.g., `/plan-schema validate docs/plans/auth-a3f9e-plan.md`).

Read the plan file and check against the validation checklist:

1. Check all required sections exist
2. Check each per-file entry has required subsections
3. Check Dependency Graph includes all files from `## Files`
4. Check for banned anti-patterns
5. Check Dependencies/Provides consistency
6. Report violations with the fix from the schema above

### If `$ARGUMENTS` is empty:

Output the quick reference:

```
Plan File Schema (docs/plans/*-plan.md)

Required sections (in order):
  ## Summary                    — 2-3 sentence executive summary
  ## Files                      — Files to Edit + Files to Create
  ## Code Context               — Investigation findings
  ## External Context           — API docs, library refs
  ## Architectural Narrative    — Task, Architecture, Requirements, Selected Approach
  ## Implementation Plan        — Per-file: Purpose, Changes, Reference Implementation, Dependencies, Provides
  ## Dependency Graph           — Phase | File | Action | Depends On
  ## Exit Criteria              — Test Commands, Success Conditions, Verification Script

Per-file format:
  ### path/to/file [edit|create]
  Purpose, TOTAL CHANGES, Changes (numbered + line numbers),
  Reference Implementation (FULL code), Migration Pattern (for edits),
  Test File (test cases to write BEFORE implementation),
  Dependencies, Provides

Dependency Graph rules:
  Phase 1 = no deps on other plan files
  Same phase = parallel (no inter-deps)
  Dependency = real code dependency (imports/extends/uses)
  TDD: Test files in EARLIER phases than production code they verify

Created by: /plan-creator, /bug-plan-creator, /code-quality-plan-creator
Consumed by: /plan-loop, /plan-swarm
```
