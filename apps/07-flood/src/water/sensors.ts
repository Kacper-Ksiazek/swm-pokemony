import { readback } from "@typegpu/kit";
import type { Frame } from "@typegpu/kit";
import type { TgpuComputePass, TgpuRoot } from "typegpu";
import { d, tgpu } from "typegpu";

import { PUSH_RATE } from "./grid";
import type { createSamples } from "./sample";

/** Points where the CPU can read the water, such as under each pier span and at each palm. */
const SENSORS = 64;

type Samples = ReturnType<typeof createSamples>;

/**
 * Writes the water at up to 64 watched points so the pier, the palms and the posts can feel it
 * on the CPU. The points are set with `watch` and arrive a frame later.
 */
export function createSensors(root: TgpuRoot, samples: Pick<Samples, "waterAt" | "currentAt">) {
  const { waterAt, currentAt } = samples;
  const sensorPoints = root.createBuffer(d.arrayOf(d.vec2f, SENSORS)).$usage("storage");
  const sensorValues = root.createBuffer(d.arrayOf(d.vec4f, SENSORS)).$usage("storage");
  const pointsIn = sensorPoints.as("readonly");
  const valuesOut = sensorValues.as("mutable");
  const sensed = new Float32Array(SENSORS * 4);
  const sensorProbe = readback.create(root, sensorValues, {
    bytes: true,
    hz: PUSH_RATE,
    decode: (bytes) => {
      sensed.set(new Float32Array(bytes));
      return sensed;
    },
  });

  const sense = tgpu.computeFn({
    workgroupSize: [SENSORS],
    in: { id: d.builtin.globalInvocationId },
  })(({ id }) => {
    "use gpu";
    if (id.x >= SENSORS) {
      return;
    }
    const place = pointsIn.$[id.x];
    valuesOut.$[id.x] = d.vec4f(waterAt(place), currentAt(place));
  });
  const sensing = root.createComputePipeline({ compute: sense });

  return {
    sensing,

    record(pass: TgpuComputePass) {
      pass.setPipeline(sensing);
      pass.dispatchWorkgroups(1);
    },

    /** Sets the points the sensors read, up to 64, as x and z. */
    watch(points: readonly (readonly [number, number])[]) {
      if (points.length > SENSORS)
        throw new RangeError(`At most ${SENSORS} sensors, got ${points.length}`);
      const padded = Array.from({ length: SENSORS }, (_, i) => d.vec2f(...(points[i] ?? [0, 0])));
      sensorPoints.write(padded);
    },

    /**
     * The water at every watched point, once it arrives: surface level, depth, then the current
     * along x and z, four numbers per point.
     */
    get sensed() {
      return sensorProbe.latest;
    },

    capture(frame: Frame) {
      sensorProbe.capture(frame);
    },

    destroy() {
      sensorProbe.destroy();
      sensorPoints.destroy();
      sensorValues.destroy();
    },
  };
}
