import { font } from "@typegpu/kit";
import interAtlas from "@typegpu/kit/fonts/inter.rgba?url";
import interData from "@typegpu/kit/fonts/inter.json?url";
import type { TgpuRoot } from "typegpu";

/** Loads Inter SemiBold, the font baked into the kit, for every piece of text in the town. */
export async function loadSans(root: TgpuRoot) {
  const [data, atlas] = await Promise.all([
    fetch(interData).then((response) => response.json()),
    fetch(interAtlas).then((response) => response.arrayBuffer()),
  ]);
  return font.create(root, font.read(data, atlas));
}

export type Sans = Awaited<ReturnType<typeof loadSans>>;
