---
name: plan-swarm
description: "Execute a plan file with parallel agent swarm (dependency-aware)"
argument-hint: "<plan_path> [--workers N] [--model MODEL]"
allowed-tools: Read, TaskCreate, TaskUpdate, TaskList, TaskGet, Task, Bash
model: opus
skills: ["test-driven-development"]
---

# Plan Swarm Command

Execute a plan file using parallel worker agents. **Requires a plan file.** All workers complete → done.

**Note:** Loop and swarm are interchangeable - swarm is just faster when tasks can run in parallel. Both enforce exit criteria and sync state.

Uses Claude Code's built-in Task Management System for dependency tracking and visual progress (`ctrl+t`).

## Orchestrator Role

**CRITICAL: The orchestrator NEVER executes tasks itself.** The orchestrator's ONLY responsibilities are:
- Reading and parsing the plan file
- Creating and managing the task graph
- Spawning worker subagents
- Processing worker completions and failures
- Tracking retry counts
- Reporting final status

**All work is delegated to subagents**, including:
- File edits/creates
- Running tests
- Diagnosis of failures
- Exit criteria verification
- Any code inspection or debugging

If something fails, spawn a subagent to investigate and fix it. Never read code files, run commands, or attempt fixes directly as the orchestrator.

## Supported Plan Types

This command works with plans from:
- `/plan-creator` - Implementation plans
- `/bug-plan-creator` - Bug fix plans
- `/code-quality-plan-creator` - LSP-powered quality plans

## Arguments

- `<plan_path>` (required): Path to the plan file
- `--workers N` (optional): Max concurrent workers (default: 3)
- `--model MODEL` (optional): Model for workers: haiku, sonnet, opus (default: sonnet)
- `--max-retries N` (optional): Max retry attempts per task (default: 5)

## Instructions

### Step 1: Read the Plan (Only)

The user invoked this skill with arguments: `$ARGUMENTS`

The first argument is the plan file path. Read it and extract tasks. **DO NOT read other files, grep, explore the codebase, or run any commands** - just parse the plan. The orchestrator's only file read is the plan itself:
1. **Files to Edit** - existing files that need modification
2. **Files to Create** - new files to create
3. **Implementation Plan** - per-file implementation instructions (including **Success Criteria** for each file)
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

A task with non-empty `blockedBy` shows as **blocked** in `ctrl+t`. When a blocking task is marked `completed`, it's automatically removed from the blocked list. A task becomes **ready** when its blockedBy list is empty.

**Task types:**
- File edits/creates → one task per file
- Major requirements → one task each
- Exit criteria verification → final task, blocked by all others

### Step 3: Spawn Workers

**Worker limit N** = `--workers` value from arguments or **3** if not specified. This is a queue — spawn up to N, then wait for completions before spawning more.

Mark each task `in_progress` before spawning its worker. Spawn up to N background workers in a **SINGLE message** (all Task calls in one response).

**TDD in worker prompts:** Workers must follow red-green-refactor, verify via Success Criteria, and report success/failure explicitly. Include TDD instructions and the task's Success Criteria in every worker prompt:

```json
Task({
  "description": "Task-1: Implement auth middleware",
  "subagent_type": "general-purpose",
  "model": "sonnet",
  "run_in_background": true,
  "prompt": "Execute this ONE task using TDD then exit:\n\nTask ID: 1\nSubject: Implement auth middleware\nDescription: <full details from plan>\n\nSuccess Criteria (from plan - MUST ALL PASS):\n- [ ] <criteria 1 from plan>\n- [ ] <criteria 2 from plan>\n- [ ] Verification command: <exact command from plan>\n\nTDD Protocol:\n- If this is a TEST FILE task: Write the tests, then run them and verify they FAIL (RED). Tests must fail because the feature is missing, not because of syntax errors.\n- If this is a PRODUCTION CODE task: Implement the code, then run the corresponding tests and verify they PASS (GREEN). Write only the minimum code needed to pass.\n- If this is a non-code task (config, types, docs): Execute directly.\n\nSteps:\n1. Execute the task following TDD protocol above\n2. Run the Success Criteria verification command to confirm completion\n3. If ALL criteria pass: commit the changed files with git add <changed-files> && git commit -m \"<brief description>\"\n4. Output your final status in EXACTLY this format (no other text after):\n\n   SUCCESS Task-1: <one-line summary of what was done>\n   \n   OR if you could not complete the task or Success Criteria failed:\n   \n   FAILURE Task-1: <reason for failure or which criteria failed>\n   \n5. Exit immediately after outputting SUCCESS or FAILURE"
})
```

**CRITICAL**: The worker MUST output `SUCCESS Task-N:` or `FAILURE Task-N:` as its final line. The orchestrator parses this to determine next action.

After all Task() calls return, output a status message like "3 workers launched. Waiting for completions." and **end your turn**. The system wakes you when a worker finishes.

### Step 4: Process Completions

When a worker finishes, you are automatically woken. **Parse the worker output** to determine success or failure:

**If worker output contains `SUCCESS Task-N:`**
1. **TaskUpdate** — mark task N as `completed`
2. **TaskList()** — see overall progress and find newly unblocked tasks
3. **Find ready tasks**: A task is ready when its status is `pending` AND its `blockedBy` list is empty
4. Mark ready tasks `in_progress` and spawn new workers if slots available (respect worker limit N)
5. Output status and **end your turn**

**If worker output contains `FAILURE Task-N:`**
1. Extract the failure reason from the output
2. Check retry count for this task (track in memory: `retries[taskId]`)
3. **If retries < max-retries** (default 5):
   - Increment retry count: `retries[taskId]++`
   - Keep task as `in_progress`
   - Spawn a NEW worker with enhanced prompt including the failure context:
   ```json
   Task({
     "description": "Task-N RETRY: ...",
     "subagent_type": "general-purpose",
     "run_in_background": true,
     "prompt": "RETRY ATTEMPT (previous failure: <failure reason>)\n\n<original task prompt>\n\nThe previous attempt failed. Analyze what went wrong and try a different approach."
   })
   ```
   - Output "Task N failed, retrying (attempt M of max-retries)..." and **end your turn**
4. **If retries >= max-retries**:
   - Mark task as `completed` with failure note in metadata: `TaskUpdate({ taskId: "N", status: "completed", metadata: { "failed": true, "reason": "<failure reason>" } })`
   - Output "Task N failed after max-retries attempts: <reason>. Marking as failed."
   - Continue with other tasks (dependents will be blocked by design flaw, not transient failure)

**Task lifecycle**: `pending` → `in_progress` → (`FAILURE` → retry) → `completed`

Repeat until all tasks completed → check for any failed tasks → report summary → say **"Swarm complete"**

## Visual Progress

Press `ctrl+t` to see task progress:
```
Tasks (2 done, 2 in progress, 3 open)
■ #3 Implement auth (Worker-1)
■ #4 Add routes (Worker-2)
□ #5 Integration tests > blocked by #3, #4
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Plan file not found | Report error and exit |
| Worker reports `FAILURE` | Spawn new worker to retry (up to max-retries), include failure context in retry prompt |
| Worker exits without SUCCESS/FAILURE | Treat as failure, spawn new worker to retry |
| Task exceeds max-retries | Mark task completed with `failed: true` metadata, continue with other tasks |
| All tasks blocked | Circular dependency - report to user |
| Context compacted | TaskList → check retry counts → spawn ready tasks → end turn |

**IMPORTANT:** Never attempt to diagnose or fix failures yourself. Always delegate to a new worker subagent with the failure context included in the prompt.

### Retry State Tracking

Track retry counts in memory during orchestration:
```
retries = { "1": 0, "2": 1, "3": 0, ... }  // taskId → attempt count
```

On context compaction, retry counts are lost. If a task is `in_progress` after compaction, treat it as attempt 0 and respawn a worker.

## Final Summary

When all tasks are completed, output a summary:

```
## Swarm Complete

**Succeeded**: X tasks
**Failed**: Y tasks (after max retries)

### Failed Tasks (if any)
- Task N: <failure reason>
- Task M: <failure reason>

### Exit Criteria
[Report the exit criteria result from the verification task worker]
```

**Note:** The exit criteria verification task is run by a worker subagent (the final task in the dependency graph). The orchestrator reports the result from that worker's output — it does NOT run verification commands itself.

If any tasks failed, the exit criteria will likely fail. Report this clearly so the user knows which tasks need manual intervention.

## Stopping

- Workers self-terminate when no work remains
- Use `/cancel-swarm` to halt early

## Example Usage

```bash
/plan-swarm docs/plans/add-user-auth.md              # Default: 3 workers
/plan-swarm docs/plans/refactor.md --workers 5       # Override: force 5 workers
/plan-swarm docs/plans/docs.md --model haiku         # Cheaper workers
```
