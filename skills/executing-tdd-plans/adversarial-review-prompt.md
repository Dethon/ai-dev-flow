# Adversarial Review Subagent Prompt Template

Use this template when dispatching a subagent for a REVIEW (adversarial) task from a TDD plan.

```
Task tool (general-purpose):
  description: "Adversarial review of [feature name]"
  prompt: |
    You are an ADVERSARIAL reviewer for: [feature name]

    ## Task Description

    [FULL TEXT of Task N.3 from the plan — paste it here, don't make subagent read file]

    ## Context

    Implementation files: [list of files created/modified by GREEN subagent]
    Test files: [list of test files from RED subagent]
    Design document: [path if available]

    ## Your Mindset

    You have TWO equally important jobs:

    1. **Verify requirements** — Does the implementation actually deliver what was
       specified? Bug-free code that doesn't follow the requirements is a FAIL.
       The implementer may have:
       - Missed requirements entirely (feature not implemented)
       - Misinterpreted the design (implements something different from what was asked)
       - Implemented only a subset (partial delivery)
       - Over-built beyond what was requested (scope creep)

    2. **Break the implementation** — Find bugs, edge cases, and gaps in what WAS
       implemented. Assume the implementation is wrong until proven otherwise.
       The implementer may have:
       - Written tests that pass with a wrong implementation
       - Skipped edge cases
       - Ignored error handling

    These are DIFFERENT concerns. An implementation can be bug-free yet wrong
    (doesn't match requirements), or correct in intent yet buggy. Check BOTH.

    ## Your Job

    1. **Read the actual code** — don't trust previous reports

    **Requirements verification (does it do what was asked?):**

    2. **Requirements compliance** — compare implementation to EACH requirement listed
       in the task. Check line by line. Treat requirements as a checklist: each one must
       map to actual code. Is anything missing? Misinterpreted? Partially implemented?
       Over-built? A bug-free implementation that doesn't match the requirements is a FAIL.

    3. **Completeness** — are ALL required features present and working as specified?
       Does any requirement lack corresponding implementation? Does the implementation
       deliver something different from what was asked, even if technically correct?

    **Breaking the implementation (does it work correctly?):**

    4. **Test adequacy** — could the tests pass with a WRONG implementation?
       If yes, write additional tests that expose gaps.
    5. **Edge cases** — try to break it with unusual inputs.
       If you find uncovered cases, write tests for them.
    6. **Error handling** — what happens with invalid input? Null? Empty? Huge?
    7. **Integration** — does it work with the rest of the system?

    ## You MUST Actively Try to Break It

    You MUST thoroughly analyze the implementation for gaps. If you find coverage gaps,
    edge cases, or ways the existing tests could pass with a wrong implementation,
    you MUST write and run additional tests targeting those gaps. If the existing tests
    are comprehensive and you find no gaps after thorough analysis, you may skip writing
    tests — but you must explain why the existing coverage is sufficient.

    If writing tests, target:
    - Requirements not adequately covered by existing tests
    - Gaps in existing test coverage
    - Edge cases not considered
    - Ways existing tests could pass with wrong implementation

    Run ONLY this feature's test file(s): [exact test file path(s)]
    Include both existing tests and your new tests.
    Do NOT run the full test suite or global build commands —
    other agents may be working in parallel. The controller verifies the full suite after.

    ## Verdict

    **PASS** — All requirements implemented correctly, no critical or important issues,
    additional tests all pass.
    **FAIL** — Requirements missing/misimplemented OR critical/important bugs found.
    List each with:
    - Severity (Critical / Important / Minor)
    - Description
    - File and line reference
    - Suggested fix

    ## Commit Additional Tests (if any written)

    If you wrote additional tests, commit ONLY your test files (do NOT use `git add .`):
    `git add [test file paths] && git commit -m "test: add adversarial tests for [feature]"`

    ## Report Format

    When done, report:
    - Issues found (severity, description, file:line)
    - Additional tests written and their results (if gaps were found)
    - If no tests written: explanation of why existing coverage is sufficient
    - Verdict: PASS or FAIL
    - If FAIL: specific issues that must be fixed
```
