---
name: code-quality-plan-creator
allowed-tools: Task, Read
argument-hint: "<file1> [file2] ... [fileN] or design-file-path"
description: LSP-powered architectural code quality analysis - works with any executor (loop or swarm). Accepts file paths to analyze or a design file from /brainstorming.
context: fork
model: opus
---

# Architectural Code Quality Planning (LSP-Powered)

Analyze code quality using Claude Code's built-in LSP for semantic understanding. Generates architectural improvement plans.

**Use the right tool:**
- **Code quality improvements** → `/code-quality-plan-creator` (this command)
- **New features/enhancements** → `/plan-creator`
- **Bug fixes** → `/bug-plan-creator`

## Arguments

File paths to analyze (one agent per file) OR a design file path:
- Single file: `/code-quality-plan-creator src/services/auth_service`
- Multiple files: `/code-quality-plan-creator src/agent src/hitl src/app`
- Glob pattern: `/code-quality-plan-creator agent/*`
- Design file: `/code-quality-plan-creator docs/designs/2025-01-15-auth-refactor-design.md`

**Tip:** For complex refactoring or quality improvement efforts, use the brainstorming skill first to create a design document describing the quality goals and target files, then pass the design file path here.

## Instructions

### Step 1: Parse Input

Parse `$ARGUMENTS` and determine the input type:

**Design file detection** — If the argument is a single file path ending in `.md` inside `docs/designs/`:
1. Use the Read tool to load the design file contents
2. Extract the list of target files from the design document
3. Proceed to Step 2 with the design file contents as additional context for each agent

**File paths** — Otherwise:
1. Extract file list from `$ARGUMENTS`
2. Validate each path exists

### Step 2: Launch Agents

For EACH target file, launch background agent:

**If design file was provided:**
```
Analyze code quality from design document:

Target file: <file-path>

Design document:
<full design file contents>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:code-quality-plan-creator-default"
run_in_background: true
prompt: "Analyze code quality from design document:\n\nTarget file: <file-path>\n\nDesign document:\n<full design file contents>"
```

**If file paths were provided directly:**
```
Analyze code quality: <file-path>
```

**REQUIRED Task tool parameters:**
```
subagent_type: "essentials:code-quality-plan-creator-default"
run_in_background: true
prompt: "Analyze code quality: <file-path>"
```

**Launch ALL agents in a single message for parallel execution.** Output a status message like "Analyzing N files..." and **end your turn**. The system wakes you when agents finish.

### Step 3: Report Results

```
## Code Quality Analysis Complete (LSP-Powered)

| File | Current | Projected | Issues | Changes Required |
|------|---------|-----------|--------|------------------|
| [path] | 6.8/10 | 9.2/10 | [N] | Yes |

Plans: docs/plans/code-quality-*.md

Next Steps:
1. Review plan files
2. Execute (loop or swarm are interchangeable):
   - `/plan-loop <plan-path>` or `/plan-swarm <plan-path>`
```

## Example Usage

```bash
/code-quality-plan-creator src/agent src/hitl src/app
/code-quality-plan-creator agent/*
/code-quality-plan-creator src/services/auth_service
/code-quality-plan-creator docs/designs/2025-01-15-auth-refactor-design.md
```
