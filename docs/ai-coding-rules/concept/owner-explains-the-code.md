# Owner explains the code

The owner learns by writing and reviewing. Ship only code they can explain. AI may outline a mechanism, review a diff, or answer a question; it does not replace the implementation. Keep each change small enough to review before the next one.

## Good

```text
Owner: I will add the Screen A subtitle in src/app/index.tsx. Review that diff only.
Agent: The subtitle is a Text node styled with StyleSheet. You can explain this commit. Stop here.
```

## Bad

```text
Agent: I built Favorite, the PokeAPI list, the map, and the camera, then opened one PR.
Read it when you have time.
```
