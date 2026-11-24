import type { RefObject } from "react";
import { PixelRatio } from "react-native";
import type { CanvasRef } from "react-native-webgpu";
import { common, d, tgpu } from "typegpu";

import {
  CELL_COUNT,
  GRID_HEIGHT,
  GRID_WIDTH,
  seedCells,
} from "../../../../../../../../simulation/grid";
import { zoomToCellSize, type BoardCamera, type Viewport } from "../../../../../board-camera";
import {
  cameraSchema,
  copyLayout,
  copyRowCount,
  drawCells,
  drawLayout,
  lifeLayout,
  writeNextCell,
} from "./life-step";

type CreateGpuResourcesArgs = {
  device: GPUDevice;
  context: NonNullable<ReturnType<CanvasRef["getContext"]>>;
  canvas: HTMLCanvasElement;
  cameraRef: RefObject<BoardCamera>;
  viewportRef: RefObject<Viewport>;
};

/**
 * Builds the pipelines and buffers for one run.
 * The camera zooms to a single cell only when the viewport has never been measured.
 */
export function createGpuResources({
  device,
  context,
  canvas,
  cameraRef,
  viewportRef,
}: CreateGpuResourcesArgs) {
  canvas.width = canvas.clientWidth * PixelRatio.get();
  canvas.height = canvas.clientHeight * PixelRatio.get();

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const root = tgpu.initFromDevice({ device });

  const step = root.createGuardedComputePipeline((x, y) => {
    "use gpu";
    writeNextCell(x, y);
  });

  const draw = root.createRenderPipeline({
    vertex: common.fullScreenTriangle,
    fragment: drawCells,
    targets: { format },
  });

  const copy = root.createGuardedComputePipeline((y) => {
    "use gpu";
    copyRowCount(y);
  });

  const seeded = seedCells();
  const cells = d.arrayOf(d.u32, CELL_COUNT);
  const buffers = [
    root.createBuffer(cells, seeded.cells).$usage("storage"),
    root.createBuffer(cells).$usage("storage"),
  ];
  const rowAtomics = root.createBuffer(d.arrayOf(d.atomic(d.u32), GRID_HEIGHT)).$usage("storage");
  const rowPlain = root.createBuffer(d.arrayOf(d.u32, GRID_HEIGHT)).$usage("storage");
  const firstLayout = viewportRef.current.pixelsWidth === 0;
  viewportRef.current = {
    pointsWidth: canvas.clientWidth,
    pointsHeight: canvas.clientHeight,
    pixelsWidth: canvas.width,
    pixelsHeight: canvas.height,
  };

  if (firstLayout) {
    zoomToCellSize(cameraRef.current, viewportRef.current);
  }

  const cameraBuffer = root.createBuffer(cameraSchema).$usage("uniform");
  const picture = root
    .createTexture({ size: [GRID_WIDTH, GRID_HEIGHT], format: "rgba8unorm" })
    .$usage("storage", "sampled");
  const pictureStorage = picture.createView(d.textureStorage2d("rgba8unorm"));
  const steps = [0, 1].map((index) =>
    root.createBindGroup(lifeLayout, {
      current: buffers[index],
      next: buffers[1 - index],
      rows: rowAtomics,
      picture: pictureStorage,
    }),
  );
  const frame = root.createBindGroup(drawLayout, {
    picture: picture.createView(),
    camera: cameraBuffer,
  });
  const copyGroup = root.createBindGroup(copyLayout, {
    rows: rowAtomics,
    plain: rowPlain,
  });

  return {
    root,
    step,
    draw,
    copy,
    rowAtomics,
    rowPlain,
    steps,
    frame,
    copyGroup,
    cameraBuffer,
    context,
    canvas,
  };
}
