---
name: plan-loop
description: "Execute a plan file with iterative loop until completion"
argument-hint: "<plan_path> [--max-iterations N]"
allowed-tools: view, TaskCreate, TaskUpdate, TaskList, TaskGet, powershell, edit, create, glob, grep
hide-from-slash-command-tool: "true"
model: opus
skills: ["test-driven-development"]
---

# Plan Loop Command

Execute a plan file iteratively until all tasks are complete AND exit criteria pass. **Requires a plan file.**

**Note:** Loop and swarm are interchangeable - swarm is just faster when tasks can run in parallel. Both enforce exit criteria and sync state.

Uses Claude Code's built-in Task Management System for dependency tracking and visual progress (`ctrl+t`).

**IMPORTANT**: The plan file is your source of truth. Exit Criteria MUST pass before the loop will end.

## Supported Plan Types

This command works with plans from:
- `/plan-creator` - Implementation plans
- `/bug-plan-creator` - Bug fix plans
- `/code-quality-plan-creator` - LSP-powered quality plans

## Arguments

- `<plan_path>` (required): Path to the plan file
- `--max-iterations N` (optional): Maximum iterations before stopping (default: unlimited)

## Instructions

### Step 1: view the Plan (Only)

The user invoked this skill with arguments: `$ARGUMENTS`

The first argument is the plan file path. view it and extract tasks. **DO NOT read other files, grep, or explore the codebase** - just parse the plan. **Never spawn sub-agents or delegate work — do ALL implementation directly yourself.**
1. **Files to Edit** - existing files that need modification
2. **Files to Create** - new files to create
3. **Implementation Plan** - per-file implementation instructions
4. **Requirements** - acceptance criteria
5. **Exit Criteria** - verification script and success conditions
6. **Dependency Graph** - file dependency phases for execution ordering

### Step 2: Create Task Graph

Create a task for each work item and build an **ID map** as you go:

```json
TaskCreate({ "subject": "Create auth types", ... })        // → task "1"
TaskCreate({ "subject": "Implement auth middleware", ... }) // → task "2"
TaskCreate({ "subject": "Add route protection", ... })     // → task "3"
TaskCreate({ "subject": "Run exit criteria", ... })        // → task "4"
```

Full TaskCreate per item:

```json
TaskCreate({
  "subject": "Implement auth middleware",
  "description": "Full implementation details from plan - self-contained",
  "activeForm": "Implementing auth middleware"
})
```

**Translate the plan's `## Dependency Graph` table to `addBlockedBy`**. The plan contains a table mapping files to phases and dependencies — use it to set up the task graph:

```
Plan's Dependency Graph:
| Phase | File                    | Action | Depends On                |
|-------|-------------------------|--------|---------------------------|
| 1     | `src/types/auth.ts`     | create | —                         |
| 2     | `src/middleware/auth.ts` | create | `src/types/auth.ts`       |
| 3     | `src/routes/auth.ts`    | edit   | `src/middleware/auth.ts`   |

File→Task map: types→"1", middleware→"2", routes→"3", exit criteria→"4"
```

```json
// Phase 1: no deps (task "1" is ready immediately)
// Phase 2: middleware depends on types
TaskUpdate({ "taskId": "2", "addBlockedBy": ["1"] })
// Phase 3: routes depends on middleware
TaskUpdate({ "taskId": "3", "addBlockedBy": ["2"] })
// Exit criteria blocked by all implementation tasks
TaskUpdate({ "taskId": "4", "addBlockedBy": ["1", "2", "3"] })
```

If the plan has no `## Dependency Graph` section (older plans), infer dependencies from per-file `Dependencies`/`Provides` fields.

A task with non-empty `blockedBy` shows as **blocked** in `ctrl+t`. When a blocking task is marked `completed`, it's automatically removed from the blocked list. A task becomes **ready** (executable) when its blockedBy list is empty.

**Task types:**
- File edits/creates → one task per file
- Major requirements → one task each
- Exit criteria verification → final task, blocked by all others

### Step 3: Execute Tasks with TDD (Red-Green-Refactor)

Follow test-driven development for every task. The plan's dependency graph ensures test files are scheduled before their corresponding production files.

**For test file tasks** (task creates/edits a test file):

1. **Claim**: `TaskUpdate({ taskId: "N", status: "in_progress" })`
2. **view**: Get test specifications from plan
3. **create tests**: Create the test file with all specified test cases
4. **RED — Verify tests fail**: Run the test file and confirm tests fail for the expected reason (feature missing, not syntax errors). This is MANDATORY — never skip.
5. **Commit**: Stage and commit the test file: `git add <test-file> && git commit -m "Add failing tests: <brief description>"`
6. **Complete**: `TaskUpdate({ taskId: "N", status: "completed" })`

**For production file tasks** (task creates/edits production code):

1. **Claim**: `TaskUpdate({ taskId: "N", status: "in_progress" })`
2. **view**: Get implementation details from plan
3. **Implement**: Make changes following plan exactly — write the minimum code to make the corresponding tests pass
4. **GREEN — Verify tests pass**: Run the corresponding test file and confirm all tests pass. This is MANDATORY.
5. **Refactor** (if needed): Clean up while keeping tests green
6. **Commit**: Stage and commit the changed files with a descriptive message: `git add <changed-files> && git commit -m "<brief description of what was implemented>"`
7. **Complete**: `TaskUpdate({ taskId: "N", status: "completed" })`
8. **Next**: Find next unblocked task via TaskList

**For non-code tasks** (config, documentation, types-only): Execute directly without the red-green cycle. Commit the changed files after completing the task.

### Step 4: Run Exit Criteria

Before declaring completion:
1. Find the `## Exit Criteria` section in the plan
2. Run the verification command
3. If it passes, say "Exit criteria passed - implementation complete"
4. If it fails, fix the issues and retry

### Step 5: Loop Until Done

Use TaskList to check progress:
- If all tasks completed AND exit criteria PASS → say "Exit criteria passed" and stop
- If exit criteria FAIL → fix issues and retry
- If tasks remain incomplete → continue with next unblocked task

**Say "Exit criteria passed" when complete.**

## Visual Progress

Press `ctrl+t` to see task progress:
```
Tasks (2 done, 1 in progress, 3 open)
✓ #1 Setup database schema
■ #2 Implement auth middleware
□ #3 Add login route > blocked by #2
□ #4 Add protected routes > blocked by #2
□ #5 Run exit criteria > blocked by #3, #4
```

## Context Recovery

If context compacts:
1. Call TaskList to see all tasks and their status
2. view the plan file again
3. Find next pending unblocked task
4. Continue implementation

## Error Handling

| Scenario | Action |
|----------|--------|
| Plan file not found | Report error and exit |
| Exit criteria fail | Fix issues and retry |
| Context compacted | TaskList → re-read plan → continue |

## Example Usage

```bash
/plan-loop docs/plans/add-user-auth.md
/plan-loop docs/plans/fix-memory-leak.md --max-iterations 10
```
