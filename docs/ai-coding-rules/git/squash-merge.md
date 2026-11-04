# Squash merge to main

Squash-merge into `main` so `main` has one commit per assignment step. The step's detailed commits stay on the pull request branch.

## Good

```text
main: one commit, "Add the Pokémon list"
PR branch: three commits for the screen, infinite scroll, and pull-to-refresh
```

## Bad

```text
A merge or rebase copies every pull request commit onto main, so main no longer has one commit per step.
```
