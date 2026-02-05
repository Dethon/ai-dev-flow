---
name: requesting-code-review
description: Request code review after completing implementation task
argument-hint: "<task-id>"
allowed-tools: powershell, Read
---

# Requesting Code Review

Use this skill after completing an implementation task to request a code review.

## When to Use

- After outputting SUCCESS for a task in plan-swarm (when reviews enabled)
- After completing implementation in implement-swarm
- Before marking a task as complete when reviews are enabled

## Instructions

### Step 1: Gather Review Context

Collect the information the reviewer needs:

1. **Task details**: The original task subject and description
2. **Changed files**: Use `git diff --name-only HEAD~1` to get list
3. **Success criteria**: Extract from task description

### Step 2: Format Output for Review

Ensure your SUCCESS output includes review-ready information:

```
SUCCESS Task-N: <summary>

## Changed Files
- <file 1>
- <file 2>

## Changes Summary
<brief description of what was done>
```

The orchestrator will automatically spawn a reviewer subagent with this context when `--review` is enabled.

## Key Points

- Include all changed files in your SUCCESS output
- Provide a clear summary of what was implemented
- The reviewer needs enough context to verify spec compliance
