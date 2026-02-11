---
name: codemap-creator
description: Generate codebase specs (semantic) for comprehensive project documentation
---

# Codebase Specs Creator

Generate **semantic** codebase specs documentation for a codebase using parallel agents.

## What Gets Created

### Codebase Specs → `docs/codebase/`
- `STACK.md` - Languages, frameworks, runtime, build tools
- `INTEGRATIONS.md` - External APIs, databases, third-party services
- `ARCHITECTURE.md` - Layers, patterns, data flow, key abstractions
- `STRUCTURE.md` - Directory organization, file naming, module boundaries
- `CONVENTIONS.md` - Naming, imports, error handling, code style
- `TESTING.md` - Test framework, patterns, coverage requirements
- `CONCERNS.md` - Technical debt, fragile areas, known risks

## Modes

### Create Mode (default)

Generate codebase specs from scratch:

```bash
/codemap-creator
/codemap-creator src/
```

### Update Mode

Update existing codebase specs with changed files:

```bash
/codemap-creator --update
/codemap-creator --update --diff
/codemap-creator --update --pr 456
```

## Arguments

- **Root directory** (optional): Starting point for analysis. Defaults to project root.
  - `/codemap-creator src/` → analyzes from `src/`
  - `/codemap-creator` → analyzes entire project
- **--update**: Enable update mode (regenerate specs based on changes)
- **--diff**: Use `git diff` to find changed files (default when `--update` is used)
- **--pr <id>**: Use GitHub PR to find changed files

## Instructions

### Step 1: Parse Input and Detect Mode

The user invoked this skill with arguments: `$ARGUMENTS`

**Update Mode** (if `--update` present):

1. Detect diff source (`--diff` or `--pr <id>`, default to `--diff`)
2. Extract optional root directory (default to `.`)
3. Proceed to Step 2 (Update Mode Only)

**Create Mode** (default):

1. Extract optional root directory (default to `.`)
2. Skip to Step 3 (Launch Agents)

### Step 2: Get Changed Files (Update Mode Only)

```bash
# For --diff (default)
git diff --name-only && git diff --staged --name-only

# For --pr <id>
gh pr diff <id> --name-only
```

### Step 3: Launch Agents

Launch 4 agents in parallel using a single message with multiple Task tool calls:

```
# Agent 1: Tech codebase specs (STACK.md, INTEGRATIONS.md)
Task(
  subagent_type: "codebase-mapper-tech",
  run_in_background: true,
  prompt: "Root: <root_dir>"
)

# Agent 2: Architecture codebase specs (ARCHITECTURE.md, STRUCTURE.md)
Task(
  subagent_type: "codebase-mapper-arch",
  run_in_background: true,
  prompt: "Root: <root_dir>"
)

# Agent 3: Quality codebase specs (CONVENTIONS.md, TESTING.md)
Task(
  subagent_type: "codebase-mapper-quality",
  run_in_background: true,
  prompt: "Root: <root_dir>"
)

# Agent 4: Concerns spec (CONCERNS.md)
Task(
  subagent_type: "codebase-mapper-concerns",
  run_in_background: true,
  prompt: "Root: <root_dir>"
)
```

Output status message and **end your turn**. The system wakes you when agents finish.

### Step 4: Report Result

**Create Mode:**

```
## Codebase Specs Created

**Location**: docs/codebase/

| File | Content |
|------|---------|
| STACK.md | Languages, frameworks, runtime |
| INTEGRATIONS.md | External services, APIs |
| ARCHITECTURE.md | Layers, patterns, data flow |
| STRUCTURE.md | Directory organization |
| CONVENTIONS.md | Code style, naming, patterns |
| TESTING.md | Test framework, strategies |
| CONCERNS.md | Tech debt, risks |

**Next**: Planning agents will automatically use this documentation.
```

**Update Mode:**

```
## Codebase Specs Updated

**Source**: git diff | PR #X
**Location**: docs/codebase/

| File | Status |
|------|--------|
| STACK.md | Updated |
| INTEGRATIONS.md | Updated |
| ARCHITECTURE.md | Updated |
| STRUCTURE.md | Updated |
| CONVENTIONS.md | Updated |
| TESTING.md | Updated |
| CONCERNS.md | Updated |
```

## Error Handling

| Scenario | Action |
|----------|--------|
| Root directory not found | Report error, suggest valid paths |
| No files in tree | Report empty, suggest different root |
| Agent fails | Report which agent failed, others continue |
| gh not installed | Report error for PR mode |

## Example Usage

```bash
# Full specs documentation (project root)
/codemap-creator

# Specs for a subdirectory
/codemap-creator src/

# Update after changes
/codemap-creator --update
/codemap-creator --update --pr 456
```
