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

    ## Your Job — Priority Hierarchy

    You have three deliverables, in strict priority order:

    **Priority 1: Make ALL tests pass** — including wiring tests (DI resolution,
    route registration, layout composition). Read the failing tests, write the
    minimal code to pass them. This includes wiring changes that tests verify.

    **Priority 2: Implement ALL "Files" section modifications** — every file
    listed under "Create" must exist with real behavior (no stubs/TODOs). Every
    file listed under "Modify" must have the specified changes applied. These are
    DI registrations, pipeline hookups, config entries, route additions, layout
    wiring. They are required deliverables, not optional extras.

    **Priority 3: Nothing beyond priorities 1 and 2** — don't add error handling
    tests don't check for, don't add features tests don't verify, don't refactor
    or optimize. If the tests are wrong, report it — don't silently change them.

    **Steps:**
    1. Read the failing tests first — understand what they expect
    2. Implement code to pass ALL tests (Priority 1)
    3. Implement ALL "Files" section modifications (Priority 2)
    4. Run ONLY this feature's test file(s): [exact test file path(s)]
       They must ALL PASS.
       Do NOT run the full test suite or global build commands (tsc, npm run build) —
       other agents may be working in parallel. The controller verifies the full suite after.
    5. Commit ONLY your implementation files (do NOT use `git add .`):
       `git add [implementation file paths] && git commit -m "feat: implement [feature]"`

    ## Critical: UI Components Must Be Styled

    If this task creates a user-facing UI component (page, modal, panel, widget),
    you MUST style it to match the codebase's existing visual patterns:
    1. Find the codebase's CSS/design system (CSS variables, theme tokens, existing styles)
    2. Examine 2-3 existing styled components for patterns (spacing, colors, shadows)
    3. Apply consistent styling — use the same CSS variables and visual language

    Unstyled HTML with class names that have no CSS rules is NOT a valid deliverable.
    Matching the codebase's visual language is part of minimum implementation, not "extra."

    ## Checklist Before Committing

    - Every file listed under "Create" → exists
    - Every file listed under "Create" → implements described behaviors from the task
      spec, not stubbed with TODO/placeholder comments. A file that exists but contains
      `// TODO: implement later` or `// Stub: will do X in a future iteration` is NOT
      a completed deliverable — it means you created the file but skipped the behavior.
    - Every file listed under "Modify" → has the specified changes applied
    - All tests pass (run them, paste output)
    - Implementation follows existing patterns in the codebase
    - No obvious bugs or security issues

    ## Response Format

    Respond with EXACTLY one of the following lines and nothing else:
    - `SUCCESS` — all tests pass
    - `FAILURE <reason>` — single line explaining what went wrong (e.g., "2 tests still failing in auth module", "cannot resolve dependency X")

    No preamble, no explanation, no summary. Just the single line above.
```
