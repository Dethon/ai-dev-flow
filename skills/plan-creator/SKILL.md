---
name: plan-creator
allowed-tools: Task, Read
argument-hint: <feature-description or design-file-path>
description: Create architectural plans for new features - works with any executor (loop or swarm). Accepts a feature description or a design file from /brainstorming. For bugs use /bug-plan-creator, for code quality use /code-quality-plan-creator.
context: fork
model: opus
---

# Architectural Plan Creator

Create comprehensive architectural plans for **new features in existing codebases** (brownfield development). Plans specify HOW to implement, not just WHAT.

**Use the right tool:**
- **New features/enhancements** → `/plan-creator` (this command)
- **Bug fixes** → `/bug-plan-creator`
- **Code quality improvements** → `/code-quality-plan-creator`

## Arguments

Takes a feature description OR a design file path:
- `"Add OAuth2 authentication with Google login"`
- `"Add user profile page with avatar upload"`
- `docs/designs/2025-01-15-oauth-design.md`

**Tip:** For complex features, use the brainstorming skill first to create a design document, then pass the design file path here.

## Instructions

### Step 1: Process Input

Parse `$ARGUMENTS` and determine the input type:

**Design file detection** — If the argument matches a file path ending in `.md` inside `docs/designs/`:
1. Use the Read tool to load the design file contents
2. Proceed to Step 2 with the design file contents as context

**Text description** — Otherwise:
1. Treat `$ARGUMENTS` as a task description
2. Grammar and spell check before passing to agent

### Step 2: Launch Agent

Launch background agent with the appropriate prompt:

**If design file was provided:**
```
Create architectural plan from design document:

<full design file contents>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:plan-creator-default"
run_in_background: true
prompt: "Create architectural plan from design document:\n\n<full design file contents>"
```

**If text description was provided:**
```
Create architectural plan: <corrected task description>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:plan-creator-default"
run_in_background: true
prompt: "Create architectural plan: <corrected task description>"
```

Output a status message like "Creating plan..." and **end your turn**. The system wakes you when the agent finishes.

### Step 3: Report Result

```
## Architectural Plan Created

**Plan**: docs/plans/{task-slug}-{hash5}-plan.md

Next Steps:
1. Review the plan
2. Execute (loop or swarm are interchangeable):
   - `/plan-loop <plan-path>` or `/plan-swarm <plan-path>`
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Agent fails | Report error, stop |
| Plan not ready | Report issues, suggest fixes |

## Example Usage

```bash
/plan-creator Add OAuth2 authentication with Google login
/plan-creator Add user profile page with avatar upload
/plan-creator Refactor the auth module to use dependency injection
/plan-creator docs/designs/2025-01-15-oauth-design.md
/plan-creator docs/designs/2025-03-22-notifications-design.md
```
