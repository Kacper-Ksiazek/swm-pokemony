import { useEffect, useRef, useState } from "react";
import { PixelRatio } from "react-native";
import {
  cancelAnimationFrame,
  requestAnimationFrame,
  useDevice,
  type CanvasRef,
} from "react-native-webgpu";
import * as THREE from "three/webgpu";

import type { BoardBlueprint } from "../../../blueprint";
import { createBoardScene, type BoardScene } from "../scene/create-board-scene";

/**
 * Owns the three.js WebGPU renderer for one `<Canvas>`.
 *
 * 1. `useDevice` asks react-native-webgpu (Dawn) for a GPU device.
 * 2. Once the canvas has a size, three gets the canvas, its context, and that device.
 *    three configures the context itself, so we never call `context.configure()`.
 * 3. Every frame: update the scene, render, then `context.present()`. React Native does not
 *    swap frames on its own like a browser does.
 */
export function useBoardRenderer(blueprint: BoardBlueprint) {
  const canvasRef = useRef<CanvasRef>(null);
  const { device } = useDevice();
  // The scene is created after the first layout, so screens get it through state.
  const [scene, setScene] = useState<BoardScene | null>(null);

  useEffect(() => {
    if (!device) {
      return;
    }

    let cancelled = false;
    let waitForLayoutId = 0;
    let renderer: THREE.WebGPURenderer | null = null;
    let boardScene: BoardScene | null = null;

    const start = () => {
      if (cancelled) {
        return;
      }

      const context = canvasRef.current?.getContext("webgpu");
      const canvas = context?.canvas as HTMLCanvasElement | undefined;

      // The native view reports 0×0 until its first layout pass. Try again next frame.
      if (!context || !canvas || canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        waitForLayoutId = requestAnimationFrame(start);

        return;
      }

      canvas.width = canvas.clientWidth * PixelRatio.get();
      canvas.height = canvas.clientHeight * PixelRatio.get();

      const activeRenderer = new THREE.WebGPURenderer({ antialias: true, canvas, context, device });
      const activeScene = createBoardScene(blueprint, canvas.clientWidth / canvas.clientHeight);

      activeRenderer.shadowMap.enabled = true;
      activeRenderer.shadowMap.type = THREE.PCFShadowMap;
      activeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      activeRenderer.toneMappingExposure = 1.05;

      activeRenderer.setAnimationLoop((timeMs: number) => {
        activeScene.update(timeMs);
        activeRenderer.render(activeScene.scene, activeScene.camera);
        context.present();
      });

      renderer = activeRenderer;
      boardScene = activeScene;
      setScene(activeScene);
    };

    waitForLayoutId = requestAnimationFrame(start);

    return () => {
      cancelled = true;
      setScene(null);
      cancelAnimationFrame(waitForLayoutId);
      renderer?.setAnimationLoop(null);
      boardScene?.dispose();
      renderer?.dispose();
    };
  }, [blueprint, device]);

  return { canvasRef, scene };
}
