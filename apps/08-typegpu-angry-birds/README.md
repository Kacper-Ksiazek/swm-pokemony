# `08-typegpu-angry-birds`

Learning track: **Angry Birds** w lekkim **2D + pseudo-izometrycznym 3D** na **TypeGPU Kit** (Vite + WebGPU). Małe etapy, żeby każdy moduł Kita miał kontekst.

## Uruchomienie

Z katalogu repo:

```bash
bun install
bun run start:08
```

Potrzebujesz przeglądarki z WebGPU (Chrome / Edge).

## Etapy (roadmapa)

| Etap          | Co robimy                                              | Moduły Kita / TypeGPU                        |
| ------------- | ------------------------------------------------------ | -------------------------------------------- |
| **0**         | szkielet Vite, `web.host`, `createScene`, shader nieba | `typegpu`, `frames` (w hostcie), `'use gpu'` |
| **1**         | orbit, plansza, światło, `finish`                      | `cameras`, `passes`, `lighting`, `instances` |
| **2** (teraz) | forteca z bloków, dane w `level.ts`                    | `meshPool` (1 mesh), 2× `instances`        |
| **3**         | proca: przeciąganie, wektor strzału (`web.pointer`)    | `web.pointer`, CPU input → uniform           |
| **4**         | pocisk + prosta fizyka (pozycja na CPU lub compute)    | `clock.fixedStep`                            |
| **5**         | kolizje, niszczenie bloków                             | własna logika + ewent. `counters`            |
| **6**         | polish: cienie, tone map, dźwięk z DOM                 | `lighting`, `finish`, `tone`                 |

Każdy etap = jeden mały PR / commit w Twoim tempie. Nie przeskakujemy — najpierw widzisz obrazek, potem dokładamy mechanikę.

## Layout plików

```text
src/
  index.ts    — web.host + orbitControls w attach
  scene.ts    — targets, pass, frame
  ground.ts     — plansza (1 wiersz instances)
  structures.ts — pętla `add` po `LEVEL_01`
  level.ts      — dane poziomu (tylko CPU, bez GPU)
```

Wzorowane na [`07-flood`](../07-flood/), ale z **`web.host`** jak w [Getting started → Host a scene](https://docs.swmansion.com/typegpu-kit/getting-started/#host-a-scene).

## Etap 2 — co powinieneś zobaczyć

Po prawej na trawie: mur drewniany + kamienne podpory + zielony „świniak”. Po lewej pusto — tam pójdzie proca (etap 3).

## Etap 2 — trik z poolem

`pool.add(meshes.box())` **raz** → ten sam `brick` w `ground` i w każdym `field.add`. Dwa osobne `instances.create` (ziemia vs bloki), wspólna geometria.

## Etap 1 — kolejność w `frame`

1. `view.update(dt)` — kamera (easing celu orbit).
2. `screen.fit()` — rozmiar bufora przy resize.
3. `light.shadow.record` — mapa cienia.
4. `scene.record` — ziemia + tło.
5. `final.record` — HDR → canvas (tone map).

## Etap 0 (archiwum)

Wcześniejszy commit: fullscreen shader zamiast sceny 3D — nadal dobry do zrozumienia `Frame` i `'use gpu'`.
