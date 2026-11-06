# Cursor automation — on-demand PR code review

This repository uses **Cursor Automations** for optional, **manual** code review on pull requests.

## How to request a review

On the pull request’s **conversation** (not necessarily inline on code), add a comment whose body includes the command:

```text
/code-review
```

A dedicated automation runs only after such a comment. **Pushes alone do not trigger this flow.**

## What it checks

The agent should review the **full PR diff** (entire branch vs base, not just the latest commit) against:

- `docs/ai-coding-rules/ROADMAP.md`
- `docs/ai-coding-rules/concept/project-brief.md`
- Relevant rule files under `docs/ai-coding-rules/` for the areas your changes touch
- `AGENTS.md` and Expo SDK discipline for native/Expo APIs

Automation output should include a marker `<!-- automated-code-review -->` in a summary PR comment so it is easy to find.

## Maintenance

The automation is configured in **Cursor → Automations** (Glass). To change triggers, instructions, or repo scope, edit that automation in the UI.

If you still have an older automation that ran on **every push**, disable or remove it there so only this **comment-triggered** automation handles code review.

## End of agent instructions (append in Glass)

Add this as the **last** paragraph of the automation’s agent prompt (after the output format and `<!-- automated-code-review -->` marker):

> If everything is good — then approve the PR.

That requires the automation to have the GitHub capability to **approve** a pull request enabled in Cursor Automations (the same tool/integration used for PR actions). If approval is not available, document that in the automation description and only post the review comment.

## Full agent prompt (copy into Glass)

Paste everything below into the automation’s **Instructions** / agent prompt field (then set trigger to **PR comment** for repo `kacper-ksiazek/swm-pokemony`, enable **Comment on PR** and approval if your plan allows).

```text
You are an automated code reviewer for the GitHub pull request that triggered this run.

**Gate (mandatory):** Inspect the triggering event. Proceed only if the **most recent pull request comment** (general/conversation comment on the PR, not a review body) contains the exact substring `/code-review` as its own token (e.g. a line that is only `/code-review`, or the phrase appears clearly as a command). If this gate fails, **stop and do nothing** — do not post any comment.

**Scope:** Review the **entire PR** — the full diff of the pull request against its base branch (`main` unless the PR states otherwise). Do not limit the review to the latest commit only.

**Rules source of truth:** Read and apply `docs/ai-coding-rules/ROADMAP.md`, `docs/ai-coding-rules/concept/project-brief.md`, and every rule file under `docs/ai-coding-rules/` that matches technologies or areas touched by the changed files (e.g. `architecture`, `navigation`, `typescript`, `react-native`, `tooling`, `expo`, `git`). Also follow `AGENTS.md` and Expo version discipline (check `package.json` expo version and prefer `npx expo install` / `bunx expo install` guidance from project rules).

**How to review:**
1. Map changed files to the relevant rule categories; cite specific rule files when flagging issues.
2. Prefer blocking issues (incorrect patterns, rule violations, likely breakages) over nitpicks.
3. If something is intentionally deferred per ROADMAP, say so and do not treat it as a defect.
4. Keep the output concise but complete across the whole PR.

**Output format:** Post **one** PR comment (conversation comment) that includes:
- A short summary (what the PR does).
- A **Rules check** section listing findings grouped by severity (Blocking / Should fix / Suggestion), each with file path and brief rationale tied to a rule.
- If no issues: state explicitly that the diff aligns with the rules checked.
- End with an HTML comment marker exactly: `<!-- automated-code-review -->` so follow-up automation can detect this summary.

If everything is good — then approve the PR.
```
