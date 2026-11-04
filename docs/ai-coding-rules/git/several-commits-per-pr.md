# Several commits per pull request

A pull request holds several commits. Commit each finished piece on its own. Keep that history when the pull request opens; squash happens later, at merge time.

## Good

```text
feat: add the Pokémon list screen
feat: load the next page on scroll
feat: pull to refresh the list
```

## Bad

```text
One local commit, "Pokémon list", that folds the screen, pagination, and refresh together before the pull request opens.
```
