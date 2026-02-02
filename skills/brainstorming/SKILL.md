---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design in small sections (200-300 words), checking after each section whether it looks right so far.

## The Process

**Understanding the idea:**

- Check out the current project state first (files, docs, recent commits)
- Check for existing codemaps before exploring manually (see below)
- Use the `AskUserQuestion` tool for ALL questions — never ask questions via plain chat text
- Ask questions one at a time (one `AskUserQuestion` call per message)
- Prefer multiple choice options when possible — use the `options` field to present 2-4 concrete choices
- For open-ended exploration, provide options that represent likely directions plus let the user pick "Other" for freeform input
- If a topic needs more exploration, break it into multiple sequential `AskUserQuestion` calls
- Focus on understanding: purpose, constraints, success criteria

**Check for existing codemaps:**

Before exploring manually, check if codemaps exist:

```
Glob(pattern="docs/maps/code-map-*.json")
```

**If codemaps found:**

1. Read the most recent codemap(s) covering relevant directories
2. Use the codemap for:
   - **File→symbol mappings** - Know what's in each file without reading it
   - **Signatures** - Get function/class signatures directly
   - **Dependencies** - See file relationships from `dependencies` field
   - **Public API** - Focus on exported symbols from `public_api`
   - **Reference counts** - Identify heavily-used vs unused code
3. Only read specific files when you need implementation details beyond the codemap

**If no codemaps found:**

- Proceed with manual exploration (files, docs, recent commits)
- Consider suggesting `/codemap-creator` for future brainstorming sessions

**Exploring approaches:**

- Use `AskUserQuestion` to propose 2-3 different approaches with trade-offs as selectable options
- Lead with your recommended option (list it first and append "(Recommended)" to the label)
- Use the `description` field on each option to explain trade-offs and reasoning

**Presenting the design:**

- Once you believe you understand what you're building, present the design
- Break it into sections of 200-300 words
- Use `AskUserQuestion` after each section to check whether it looks right so far (e.g., options: "Looks good", "Needs changes")
- Cover: architecture, components, data flow, error handling, testing
- Be ready to go back and clarify if something doesn't make sense

## After the Design

**Documentation:**

- Write the validated design to `docs/designs/YYYY-MM-DD-<topic>-design.md`
- Use elements-of-style:writing-clearly-and-concisely skill if available
- Commit the design document to git

## Key Principles

- **Always use AskUserQuestion** - Never ask questions via plain chat; always use the tool
- **One question at a time** - One `AskUserQuestion` call per message
- **Multiple choice preferred** - Use options to make answering easy; open-ended via "Other"
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design in sections, validate each
- **Be flexible** - Go back and clarify when something doesn't make sense
