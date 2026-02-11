# Triplet Runner Subagent Prompt Template

Use this template when dispatching a subagent to handle one complete triplet (RED → GREEN → REVIEW) autonomously. Used in **parallel batch mode** and **team mode**.

The triplet runner dispatches its own sub-subagents for each step to maintain fresh context per task.

```
Task tool (general-purpose, model: sonnet):
  description: "Execute triplet for [feature name]"
  prompt: |
    You are executing a complete TDD triplet for: [feature name]

    ## Triplet Tasks

    ### Task N.1 — RED (Write Failing Tests)

    [FULL TEXT of Task N.1 from the plan]

    ### Task N.2 — GREEN (Implement)

    [FULL TEXT of Task N.2 from the plan]

    ### Task N.3 — REVIEW (Adversarial)

    [FULL TEXT of Task N.3 from the plan]

    ## Context

    [Scene-setting: what was built before, dependencies, architecture, working directory]

    ## Your Job

    Execute the three tasks SEQUENTIALLY. For each task, dispatch a fresh
    subagent using the Task tool (subagent_type: "general-purpose").

    ### Step 1: RED

    Dispatch a subagent to write the failing tests (Task N.1).
    - Include the full task text in the subagent prompt
    - When it returns, VERIFY: run the tests, confirm ALL FAIL
    - If tests pass: something is wrong — diagnose before proceeding
    - If subagent asks questions: answer them, re-dispatch if needed

    ### Step 2: GREEN

    Only after RED is verified (all tests fail).
    Dispatch a subagent to implement the feature (Task N.2).
    - Include the full task text + context about where tests live
    - When it returns, VERIFY: run the tests, confirm ALL PASS
    - If tests fail: re-dispatch with specific failure information
    - Maximum 2 re-dispatch attempts, then report failure

    ### Step 3: REVIEW

    Only after GREEN is verified (all tests pass).
    Dispatch a subagent for adversarial review (Task N.3).
    - Include the full task text + implementation file list + test file list
    - When it returns, check the verdict

    **If verdict = PASS:** Triplet complete. Report success.

    **If verdict = FAIL:**
    1. Read the issues list
    2. Critical/Important: dispatch a fix subagent with specific fix instructions
    3. After fix: re-dispatch REVIEW subagent to verify
    4. Maximum 2 fix cycles, then report failure with unresolved issues

    ## Verification Commands

    [Exact test commands from the plan, e.g., "pytest tests/test_feature.py -v"]

    ## Report Format

    When done, report:
    - Verdict: PASS (all three tasks complete) or FAIL (with details)
    - Files created/modified
    - Test results (number passing)
    - If FAIL: what went wrong, what was tried, unresolved issues

    ## Rules

    - NEVER skip a step. RED before GREEN before REVIEW. Always.
    - NEVER combine steps into one subagent dispatch.
    - ALWAYS verify between steps (run tests, check results).
    - If blocked at any step, report the blocker — don't guess.
    - Fresh subagent per step (no context pollution).
```

## Team Mode Addendum

When used within a team (agent teams enabled), add this section to the prompt:

```
    ## Team Communication

    You are a pipeline agent on the [team-name] team.
    - Report completion or blockers to the orchestrator via SendMessage
    - If you need codebase information, ask the orchestrator (who will query Explorer)
    - Do NOT search outside your assigned scope
    - When done, mark your task completed via TaskUpdate

    Report format to orchestrator:
    - "Triplet [feature] PASS — [N] tests passing, files: [list]"
    - "Triplet [feature] FAIL — [issue summary], needs: [what's needed]"
```
