---
name: receiving-code-review
description: Process code review feedback and fix issues
argument-hint: "<review-output>"
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Receiving Code Review

Use this skill when you receive code review feedback to fix identified issues.

## When to Use

- After reviewer outputs REVIEW_ISSUES
- To address Critical and Important issues before re-review

## Instructions

### Step 1: Parse Review Feedback

Extract from the review:
1. **Critical issues** - MUST fix all of these
2. **Important issues** - SHOULD fix all of these
3. **Suggestions** - MAY fix these (optional)

### Step 2: Fix Issues

For each Critical and Important issue:
1. Navigate to the file:line cited
2. Understand the problem described
3. Apply the suggested fix or an equivalent solution
4. Verify the fix doesn't break existing tests

### Step 3: Run Verification

After fixing all issues:
```bash
# Run tests for affected files
# Run linter if applicable
```

### Step 4: Output Completion

```
SUCCESS Task-N: Fixed review issues

## Changed Files
- <file 1>
- <file 2>

## Fixes Applied
### Critical:
- [x] <issue 1> - Fixed at <file:line>

### Important:
- [x] <issue 1> - Fixed at <file:line>
```

The orchestrator will spawn a reviewer for re-review.

## Key Principle

**Technical correctness over social comfort** - Verify before implementing, ask before assuming. If a suggested fix would break something else, push back with evidence.
