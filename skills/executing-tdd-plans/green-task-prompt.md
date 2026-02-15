# GREEN Task Subagent Prompt Template

Use this template when dispatching a subagent for a GREEN (implementation) task from a TDD plan.

```
Task tool (general-purpose):
  description: "Implement [feature name]"
  prompt: |
    You are implementing: [feature name]

    ## Task Description

    [FULL TEXT of Task N.2 from the plan — paste it here, don't make subagent read file]

    ## Context

    [Scene-setting: what was built before, where tests live, relevant architecture]

    ## Failing Tests

    Tests from the RED phase exist at: [test file path]
    These tests currently FAIL because the implementation doesn't exist yet.

    ## Before You Begin

    If ANYTHING is unclear about:
    - The requirements or approach
    - Where implementation files should go
    - Dependencies or patterns to follow

    **Ask now.** Don't guess.

    ## Your Job

    1. Read the failing tests first — understand what they expect
    2. Write the MINIMAL code to make ALL tests pass
    3. Do NOT add functionality beyond what the tests require (YAGNI)
    4. Run ONLY this feature's test file(s): [exact test file path(s)]
       They must ALL PASS.
       Do NOT run the full test suite or global build commands (tsc, npm run build) —
       other agents may be working in parallel. The controller verifies the full suite after.
    5. Commit ONLY your implementation files (do NOT use `git add .`):
       `git add [implementation file paths] && git commit -m "feat: implement [feature]"`

    ## Critical: Minimal Implementation

    Your goal is to make the tests pass, nothing more.
    - Don't add error handling the tests don't check for
    - Don't add features the tests don't verify
    - Don't refactor or optimize prematurely
    - If the tests are wrong, report it — don't silently change them

    ## Self-Review Before Reporting

    Before reporting back, check:
    - All tests pass (run them, paste output)
    - Implementation is minimal (no extra features)
    - Code follows existing patterns in the codebase
    - No obvious bugs or security issues

    ## Report Format

    When done, report:
    - What you implemented (files created/modified)
    - Test run output showing ALL PASSING
    - Number of tests: 0 failing, X passing
    - Self-review findings (if any)
    - Any concerns
```
