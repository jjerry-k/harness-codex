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
