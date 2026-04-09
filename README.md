# harness-codex

A Codex skill for designing a **Codex-ready execution harness** before implementation starts.

Instead of jumping straight into code, `harness-codex` helps Codex first decide:
- which coordination pattern to use
- which roles are needed
- what can run in parallel
- what must stay sequential
- what validation loop should be used
- what ready-to-use role prompts should be generated

## Repository structure

```text
harness-codex/
├── README.md
├── LICENSE
├── .gitignore
└── skills/
    └── harness-codex/
        ├── SKILL.md
        └── references/
```

## Install with skill-installer

After pushing this repository to GitHub, install the skill with:

```bash
$skill-installer https://github.com/<owner>/harness-codex/tree/main/skills/harness-codex
```

Or explicitly set the installed skill name:

```bash
$skill-installer --name harness-codex https://github.com/<owner>/harness-codex/tree/main/skills/harness-codex
```

## What the skill does

`harness-codex` is a meta skill. It is meant for requests like:
- design a Codex harness for this project
- split this work into roles first
- create an orchestrator for this task
- choose the right coordination pattern before implementation
- tailor a Codex workflow to this use case

The skill should design the harness first, then suggest execution flow.

It now also supports designing a **spawn decision** for pseudo-team execution:
- single-session
- spawn-optional
- spawn-recommended

## Recommended architecture

This repository now follows the recommended split:
- `harness-codex`: designs the harness
- `team-runner`: later executes a generated team spec via subagents/sessions

The MVP architecture is documented in:
- `docs/teams-mvp-architecture.md`
- `docs/run-workflow.md`
- `team-runner/spec/team-spec-format.md`
- `team-runner/spec/artifact-convention.md`
- `team-runner/spec/merge-protocol.md`
- `team-runner/MVP-TODO.md`

A minimal runnable `team-runner` code skeleton is also included under:
- `team-runner/bin/`
- `team-runner/src/`
- `team-runner/examples/`

Current MVP runtime behavior:
- validates JSON/YAML team specs
- builds an execution plan
- creates artifact stub files
- creates ready-to-use role prompt files
- prepares merge and validation planning
- includes an experimental `execute` path that runs Codex role prompts sequentially in report-only mode
- includes `execute-lite`, which runs only orchestrator/reviewer-style roles for better reliability
- if Codex execution hangs or fails, it writes fallback artifacts instead of blocking the whole run
- does not yet do true parallel subagent orchestration

## Included references

- `architecture-patterns.md`
- `orchestrator-template.md`
- `validation-loop.md`
- `skill-writing-guide.md`
- `skill-testing-guide.md`

## Development note

The actual skill content lives under:

- `skills/harness-codex/SKILL.md`

If you update the skill behavior, edit that file and the matching documents in `references/`.
