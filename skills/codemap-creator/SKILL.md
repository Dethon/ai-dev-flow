---
name: codemap-creator
allowed-tools: task, powershell, glob
argument-hint: "<root_dir> [--ignore <patterns>] [--codemap-only | --specs-only] | --update [--codemap-only | --specs-only] [--diff | --pr <id>]"
description: Generate code map (structural) and codebase specs (semantic) for comprehensive project documentation
context: fork
model: opus
---

# Code Map & Codebase Specs Creator

Generate both **structural** (codemap) and **semantic** (codebase specs) documentation for a codebase using parallel agents.

## What Gets Created

### Codemap (structural) → `docs/codebase/maps/`
- `code-map-{name}.json` - LSP-extracted symbols, signatures, dependencies

### Codebase Specs (semantic) → `docs/codebase/`
- `STACK.md` - Languages, frameworks, runtime, build tools
- `INTEGRATIONS.md` - External APIs, databases, third-party services
- `ARCHITECTURE.md` - Layers, patterns, data flow, key abstractions
- `STRUCTURE.md` - Directory organization, file naming, module boundaries
- `CONVENTIONS.md` - Naming, imports, error handling, code style
- `TESTING.md` - Test framework, patterns, coverage requirements
- `CONCERNS.md` - Technical debt, fragile areas, known risks

## Modes

### Create Mode (default)

Generate codemap and codebase specs from scratch:

```bash
/codemap-creator src/
/codemap-creator . --ignore "node_modules,dist"
```

### Create Mode (partial)

Generate only codemap or only codebase specs:

```bash
/codemap-creator src/ --codemap-only
/codemap-creator src/ --specs-only
```

### Update Mode

Update existing codemap(s) and codebase specs with changed files:

```bash
/codemap-creator --update                           # Auto-detect codemaps, update all
/codemap-creator --update --codemap-only            # Only update codemaps
/codemap-creator --update --specs-only              # Only update codebase specs
/codemap-creator --update --diff                    # Use git diff (default)
/codemap-creator --update --pr 456                  # Use PR diff
```

## Arguments

### Create Mode

- **Root directory** (required): Starting point for analysis
  - `/codemap-creator src/` → analyzes from `src/` as root
  - `/codemap-creator .` → analyzes entire project

- **Ignore patterns** (optional): Skip files/directories
  - `/codemap-creator src/ --ignore "*.test.ts,node_modules"`

- **Partial generation** (optional):
  - `--codemap-only` → Only generate structural codemap
  - `--specs-only` → Only generate semantic codebase specs

### Update Mode

- **--update** (required): Enable update mode (auto-detects codemaps in `docs/codebase/maps/`)
- **--codemap-only** (optional): Only update structural codemaps
- **--specs-only** (optional): Only update semantic codebase specs
- **--diff** (optional): Use `git diff` to find changed files (default)
- **--pr <id>** (optional): Use GitHub PR to find changed files

## Instructions

### Step 1: Parse Input and Detect Mode

The user invoked this skill with arguments: `$ARGUMENTS`

**Update Mode** (if `--update` present):

1. Detect diff source (`--diff` or `--pr <id>`, default to `--diff`)
2. Check for partial flags: `--codemap-only` or `--specs-only`
3. Proceed to Step 2 (Update Mode Only)

**Create Mode** (default):

1. **Root directory** (required, first argument, default to `.`)
2. **Ignore patterns** (optional `--ignore`)
3. **Partial flags**: Check for `--codemap-only` or `--specs-only`
4. Skip to Step 3 (Launch Agents)

### Step 2: Discover Codemaps and Changed Files (Update Mode Only)

**Step 2a: Find Existing Codemaps**

```bash
# Use Glob to find all codemaps
Glob(pattern="docs/codebase/maps/code-map-*.json")
```

If no codemaps found, report error and suggest using create mode.

**Step 2b: Extract Root Directories**

For each codemap found, read the file and extract the `root` field. This determines:
- Which directories the codemaps cover
- Where to scope the changed file filtering

**Step 2c: Get Changed Files**

```bash
# For --diff (default)
git diff --name-only && git diff --staged --name-only

# For --pr <id>
gh pr diff <id> --name-only
```

Filter changed files to those within each codemap's root directory.

### Step 3: Launch Agents

**Create Mode - Full (default):**

Launch 5 agents in parallel using a single message with multiple Task tool calls:

```
# Agent 1: Codemap (structural)
Task(
  subagent_type: "codemap-creator-default",
  run_in_background: true,
  prompt: "MODE: create\nRoot: <root_dir>\nIgnore: <patterns or none>"
)

# Agent 2: Tech codebase specs (STACK.md, INTEGRATIONS.md)
Task(
  subagent_type: "codebase-mapper-tech",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

# Agent 3: Architecture codebase specs (ARCHITECTURE.md, STRUCTURE.md)
Task(
  subagent_type: "codebase-mapper-arch",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

# Agent 4: Quality codebase specs (CONVENTIONS.md, TESTING.md)
Task(
  subagent_type: "codebase-mapper-quality",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

# Agent 5: Concerns spec (CONCERNS.md)
Task(
  subagent_type: "codebase-mapper-concerns",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)
```

**Create Mode - Codemap Only (`--codemap-only`):**

Launch only Agent 1.

**Create Mode - Codebase Specs Only (`--specs-only`):**

Launch only Agents 2-5.

**Update Mode - Full (default):**

Launch codemap update agent(s) AND codebase spec agents in parallel:

```
# For EACH codemap found, launch an update agent:
Task(
  subagent_type: "codemap-creator-default",
  run_in_background: true,
  prompt: "MODE: update\nCodemap: <codemap_path>\nChanged files:\n- file1.ts\n..."
)

# Plus launch all 4 codebase spec agents (using first codemap's root or ".")
Task(
  subagent_type: "codebase-mapper-tech",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

Task(
  subagent_type: "codebase-mapper-arch",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

Task(
  subagent_type: "codebase-mapper-quality",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)

Task(
  subagent_type: "codebase-mapper-concerns",
  run_in_background: true,
  prompt: "Root: <root_dir>\nIgnore: <patterns or none>"
)
```

**Update Mode - Codemap Only (`--codemap-only`):**

Launch only the codemap update agent(s).

**Update Mode - Specs Only (`--specs-only`):**

Launch only the 4 codebase spec agents.

Output status message and **end your turn**. The system wakes you when agents finish.

### Step 4: Report Result

**Create Mode - Full:**

```
## Codebase Documentation Created

### Codemap (structural)
**Map**: docs/codebase/maps/code-map-{name}.json

| Metric | Count |
|--------|-------|
| Directories | X |
| Files | X |
| Symbols | X |

### Codebase Specs (semantic)
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

**Update Mode - Full:**

```
## Codebase Documentation Updated

### Codemaps (structural)
**Source**: git diff | PR #X

| Map | Updated | Added | Removed |
|-----|---------|-------|---------|
| code-map-{name}.json | X | X | X |

### Codebase Specs (semantic)
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

**Update Mode - Codemap Only:**

```
## Codemaps Updated

**Source**: git diff | PR #X

| Map | Updated | Added | Removed |
|-----|---------|-------|---------|
| code-map-{name}.json | X | X | X |
```

**Update Mode - Specs Only:**

```
## Codebase Specs Updated

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
| No codemaps found (update) | Report error, suggest create mode first |
| No files in tree | Report empty, suggest different root |
| Agent fails | Report which agent failed, others continue |
| gh not installed | Report error for PR mode |

## Example Usage

```bash
# Full documentation (codemap + all specs)
/codemap-creator src/
/codemap-creator . --ignore "node_modules,dist,coverage"

# Codemap only (structural)
/codemap-creator src/ --codemap-only

# Codebase Specs only (semantic)
/codemap-creator src/ --specs-only

# Update everything after changes (auto-detects codemaps)
/codemap-creator --update
/codemap-creator --update --pr 456

# Update only codemaps (faster)
/codemap-creator --update --codemap-only

# Update only codebase specs
/codemap-creator --update --specs-only
```
