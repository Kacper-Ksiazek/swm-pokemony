import * as THREE from "three/webgpu";

import type { BoardBlueprint } from "../../../blueprint";
import { createSpinnerMaterial } from "./materials/spinner-material";
import { createTerrainMaterial } from "./materials/terrain-material";
import { createTileMaterial } from "./materials/tile-material";
import {
  BOARD_THICKNESS,
  CAMERA_AZIMUTH,
  CAMERA_FOV,
  SKY_COLOR,
  SPINNER_POSITION,
  SPINNER_RADIUS,
} from "./scene.constants";
import { createCameraRig } from "./camera-rig";
import { createPawnLayer, type PawnState } from "./pawn-layer";
import { createTerrainField } from "./terrain-field";
import { createTileGeometry } from "./tile-geometry";

export type { PawnState } from "./pawn-layer";

export type BoardScene = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Advances idle animation. `timeMs` is the frame timestamp from the render loop. */
  update: (timeMs: number) => void;
  resize: (width: number, height: number) => void;
  /** Puts every player's vehicle on its tile; `currentId` gets the "your turn" bob. */
  setPawns: (pawns: PawnState[], currentId: number | null) => void;
  /** Follows that player's vehicle with the camera, or shows the whole board for `null`. */
  focusPawn: (id: number | null) => void;
  /** Orbit around the focus point by finger travel in points. */
  orbit: (deltaX: number, deltaY: number) => void;
  /** Turn around the vertical axis by a two-finger twist, in radians. */
  rotate: (radians: number) => void;
  /** Pinch scale since the last call (above 1 zooms in). */
  zoom: (scale: number) => void;
  dispose: () => void;
};

/** Board surface sits at y = 0; everything on the table is placed on top of it. */
const TABLE_TOP = 0;

function createBoard(blueprint: BoardBlueprint) {
  const { width, depth } = blueprint.size;
  const geometry = new THREE.BoxGeometry(width, BOARD_THICKNESS, depth);
  const edgeMaterial = new THREE.MeshStandardNodeMaterial({ color: 0x1d2340, roughness: 0.6 });
  const field = createTerrainField(blueprint);
  const terrainMaterial = createTerrainMaterial(field, width);

  // BoxGeometry groups: +x, -x, +y (top), -y, +z, -z.
  const board = new THREE.Mesh(geometry, [
    edgeMaterial,
    edgeMaterial,
    terrainMaterial,
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
  ]);

  board.position.y = TABLE_TOP - BOARD_THICKNESS / 2;
  board.receiveShadow = true;

  return { board, field };
}

/** The whole road is one merged mesh: one draw call, tile colors come from vertex colors. */
function createTiles(blueprint: BoardBlueprint) {
  const tiles = new THREE.Mesh(createTileGeometry(blueprint), createTileMaterial());

  tiles.castShadow = true;
  tiles.receiveShadow = true;

  return tiles;
}

function createSpinner() {
  const group = new THREE.Group();
  const white = new THREE.MeshStandardNodeMaterial({ color: 0xf7f7f7, roughness: 0.35 });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(SPINNER_RADIUS * 1.12, SPINNER_RADIUS * 1.2, 0.3, 48),
    white,
  );
  base.position.y = 0.15;

  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(SPINNER_RADIUS, SPINNER_RADIUS, 0.14, 64),
    createSpinnerMaterial(),
  );
  wheel.position.y = 0.37;

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.9, 6), white);
  post.position.y = 0.8;

  for (const mesh of [base, wheel, post]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  group.add(base, wheel, post);
  group.position.set(SPINNER_POSITION.x, TABLE_TOP, SPINNER_POSITION.z);

  return { group, wheel };
}

/** A red octagon sign on a post beside every stop tile, facing the camera. */
function createStopSigns(blueprint: BoardBlueprint) {
  const stops = blueprint.tiles.filter((tile) => tile.kind === "stop");
  const group = new THREE.Group();
  const post = new THREE.CylinderGeometry(0.035, 0.035, 0.75, 6);
  const plate = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
  const rim = new THREE.CylinderGeometry(0.34, 0.34, 0.04, 8);
  const postMaterial = new THREE.MeshStandardNodeMaterial({ color: 0xd9d9d9, metalness: 0.6 });
  const plateMaterial = new THREE.MeshStandardNodeMaterial({ color: 0xe63946, roughness: 0.35 });
  const rimMaterial = new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.4 });

  for (const tile of stops) {
    // Stand the sign half a tile to the side of the road.
    const side = tile.heading + Math.PI / 2;
    const sign = new THREE.Group();
    const face = new THREE.Group();
    const postMesh = new THREE.Mesh(post, postMaterial);
    const plateMesh = new THREE.Mesh(plate, plateMaterial);
    const rimMesh = new THREE.Mesh(rim, rimMaterial);

    postMesh.position.y = 0.375;
    plateMesh.position.y = 0.012;
    rimMesh.position.y = -0.012;
    face.add(plateMesh, rimMesh);
    face.rotation.set(Math.PI / 2, 0, Math.PI / 8);
    face.position.y = 0.85;

    sign.add(postMesh, face);
    sign.position.set(
      tile.position.x + Math.cos(side) * 0.72,
      TABLE_TOP,
      tile.position.z + Math.sin(side) * 0.72,
    );
    // Turn the octagon toward the camera, which looks from the CAMERA_AZIMUTH corner.
    sign.rotation.y = CAMERA_AZIMUTH;

    for (const mesh of [postMesh, plateMesh, rimMesh]) {
      mesh.castShadow = true;
    }

    group.add(sign);
  }

  return group;
}

function createLights(blueprint: BoardBlueprint) {
  const hemisphere = new THREE.HemisphereLight(0xe6f4ff, 0x4f6b2f, 1.4);
  const sun = new THREE.DirectionalLight(0xfff2dd, 2.6);
  const halfSize = Math.max(blueprint.size.width, blueprint.size.depth) / 2 + 1;

  sun.position.set(-10, 22, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -halfSize;
  sun.shadow.camera.right = halfSize;
  sun.shadow.camera.top = halfSize;
  sun.shadow.camera.bottom = -halfSize;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0005;

  return [hemisphere, sun];
}

export function createBoardScene(blueprint: BoardBlueprint, aspect: number): BoardScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 300);
  const spinner = createSpinner();
  const { board, field } = createBoard(blueprint);
  const pawns = createPawnLayer(blueprint);
  const rig = createCameraRig(camera, blueprint);
  let previousTimeMs: number | null = null;

  scene.background = new THREE.Color(SKY_COLOR);
  scene.add(
    board,
    createTiles(blueprint),
    createStopSigns(blueprint),
    spinner.group,
    pawns.group,
    ...createLights(blueprint),
  );
  rig.setAspect(aspect);
  rig.follow(null);
  rig.snap();

  return {
    scene,
    camera,
    update: (timeMs) => {
      const deltaSeconds = Math.min(0.1, (timeMs - (previousTimeMs ?? timeMs)) / 1000);

      previousTimeMs = timeMs;
      spinner.wheel.rotation.y = -timeMs * 0.0004;
      pawns.update(deltaSeconds, timeMs / 1000);
      rig.update(deltaSeconds);
    },
    resize: (width, height) => rig.setAspect(width / height),
    setPawns: (states, currentId) => pawns.sync(states, currentId),
    focusPawn: (id) => rig.follow(id === null ? null : () => pawns.positionOf(id)),
    orbit: rig.orbit,
    rotate: rig.rotate,
    zoom: rig.zoom,
    dispose: () => {
      field.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material) ? object.material : [object.material];

          materials.forEach((material: THREE.Material) => material.dispose());
        }
      });
    },
  };
}
