---
allowed-tools: Task, Bash, Read
argument-hint: <any-input or design-file-path>
description: Deep bug investigation with architectural fix plan generation - works with any executor (loop or swarm). Accepts error logs, stack traces, user reports, or a design file from /brainstorming.
context: fork
model: opus
---

# Bug Investigation & Architectural Fix Planning

Investigate bugs from any input - error logs, stack traces, user reports. Creates an architectural fix plan with exact code specifications.

**Use the right tool:**
- **Bug fixes** → `/bug-plan-creator` (this command)
- **New features/enhancements** → `/plan-creator`
- **Code quality improvements** → `/code-quality-plan-creator`

**Note**: Only view-only git commands allowed (no state modifications).

## Arguments

Takes any input:
- Error logs: `"TypeError: 'NoneType' at auth.py:45"`
- Stack traces: `"$(cat stacktrace.txt)"`
- Log files: `./logs/error.log`
- User reports: `"Login fails when user has no profile"`
- Diagnostic instructions: `"Check docker logs for api-service"`
- Design files: `docs/designs/2025-01-15-auth-fix-design.md`

**Tip:** For complex bugs, use the brainstorming skill first to explore the problem and create a design document, then pass the design file path here.

## Instructions

### Step 1: Process Input

Parse `$ARGUMENTS` and determine the input type:

**Design file detection** — If the argument matches a file path ending in `.md` inside `docs/designs/`:
1. Use the Read tool to load the design file contents
2. Proceed to Step 2 with the design file contents as context

**File path** — If a non-design file path → use Read tool to load contents

**Inline text** — Extract error signals

**Diagnostic instructions** — Execute commands:
- Docker logs: `docker logs <container> --tail 500`
- Process logs: `journalctl -u <service>`

### Step 2: Launch Agent

Launch background agent with the appropriate prompt:

**If design file was provided:**
```
Investigate bug and create fix plan from design document:

<full design file contents>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:bug-plan-creator-default"
run_in_background: true
prompt: "Investigate bug and create fix plan from design document:\n\n<full design file contents>"
```

**If other input was provided:**
```
Investigate bug and create fix plan:

<all gathered logs, errors, context>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:bug-plan-creator-default"
run_in_background: true
prompt: "Investigate bug and create fix plan:\n\n<gathered context>"
```

Output a status message like "Investigating bug..." and **end your turn**. The system wakes you when the agent finishes.

### Step 3: Report Result

```
## Bug Investigation Complete

**Plan**: docs/plans/bug-{id}-{hash5}-plan.md
**Severity**: [Critical/High/Medium/Low]
**Root Cause Confidence**: [High/Medium/Low]

Root Cause: [file:line] - [brief description]

Next Steps:
1. Review the fix plan
2. Execute (loop or swarm are interchangeable):
   - `/plan-loop <plan-path>` or `/plan-swarm <plan-path>`
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Log file missing | Report error, continue with other data |
| Diagnostic fails | Report error, continue |
| Low confidence | Highlight, recommend review |
| No bug found | Report external/config causes |

## Example Usage

```bash
/bug-plan-creator "TypeError: 'NoneType' at auth.py:45" "Login fails with no profile"
/bug-plan-creator ./logs/error.log "API returns 500 on POST /users"
/bug-plan-creator "$(cat stacktrace.txt)" "Crash on submit"
/bug-plan-creator "ConnectionError: timeout" "Run 'docker logs db --tail 100'"
/bug-plan-creator docs/designs/2025-01-15-auth-fix-design.md
```
