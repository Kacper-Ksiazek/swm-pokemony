# `06_conway_game_of_life` — Conway's Game of Life

Expo SDK 58 app for John Conway's cellular automaton (1970). Each generation is one TypeGPU compute dispatch on WebGPU (`react-native-webgpu`): one thread per cell, two storage buffers that swap. The fragment shader only draws the buffer that dispatch just wrote.

Rules are B3/S23 on a 4096×4096 grid that wraps. The first buffer is filled on the CPU once (`seedCells`). After that, JavaScript does not read the cells. The canvas fills the screen in any orientation.

Expo Go does not include WebGPU. Use the dev build (`bun run ios:06`).

## Run

```bash
bun run start:06
bun run ios:06
```

Bundle id: `com.anonymous.conway06`.
