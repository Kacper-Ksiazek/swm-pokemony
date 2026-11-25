import * as THREE from "three/webgpu";

import type { VehicleId } from "../../../vehicles";

/*
 * Low-poly vehicles built from boxes and cylinders, so no model files are needed.
 * Every model faces +x (the scene turns it to the tile heading) and sits on y = 0.
 */

type Part = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  rotation?: [number, number, number];
};

const glass = () => new THREE.MeshStandardNodeMaterial({ color: 0xdbeafe, roughness: 0.15 });
const rubber = () => new THREE.MeshStandardNodeMaterial({ color: 0x1f2937, roughness: 0.8 });
const paint = (color: string) =>
  new THREE.MeshStandardNodeMaterial({ color, roughness: 0.35, metalness: 0.15 });

function wheels(positions: [number, number][], radius: number, width: number, y: number): Part[] {
  const geometry = new THREE.CylinderGeometry(radius, radius, width, 14);
  const material = rubber();

  return positions.map(([x, z]) => ({
    geometry,
    material,
    position: [x, y, z],
    rotation: [Math.PI / 2, 0, 0],
  }));
}

function carParts(color: string): Part[] {
  return [
    {
      geometry: new THREE.BoxGeometry(0.56, 0.15, 0.3),
      material: paint(color),
      position: [0, 0.13, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.3, 0.12, 0.26),
      material: glass(),
      position: [-0.03, 0.26, 0],
    },
    ...wheels(
      [
        [0.18, 0.15],
        [0.18, -0.15],
        [-0.18, 0.15],
        [-0.18, -0.15],
      ],
      0.07,
      0.06,
      0.07,
    ),
  ];
}

function camperParts(color: string): Part[] {
  return [
    {
      geometry: new THREE.BoxGeometry(0.62, 0.26, 0.31),
      material: paint(color),
      position: [0, 0.2, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.62, 0.05, 0.32),
      material: new THREE.MeshStandardNodeMaterial({ color: 0xffffff, roughness: 0.5 }),
      position: [0, 0.35, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.08, 0.1, 0.27),
      material: glass(),
      position: [0.29, 0.24, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.3, 0.08, 0.32),
      material: glass(),
      position: [-0.08, 0.24, 0],
    },
    ...wheels(
      [
        [0.2, 0.15],
        [0.2, -0.15],
        [-0.2, 0.15],
        [-0.2, -0.15],
      ],
      0.07,
      0.06,
      0.07,
    ),
  ];
}

function motorbikeParts(color: string): Part[] {
  return [
    {
      geometry: new THREE.BoxGeometry(0.4, 0.08, 0.08),
      material: paint(color),
      position: [0, 0.17, 0],
    },
    {
      geometry: new THREE.CapsuleGeometry(0.06, 0.12, 4, 10),
      material: paint("#374151"),
      position: [-0.04, 0.32, 0],
    },
    {
      geometry: new THREE.SphereGeometry(0.06, 14, 10),
      material: paint(color),
      position: [-0.02, 0.45, 0],
    },
    ...wheels(
      [
        [0.16, 0],
        [-0.16, 0],
      ],
      0.1,
      0.05,
      0.1,
    ),
  ];
}

function busParts(color: string): Part[] {
  return [
    {
      geometry: new THREE.BoxGeometry(0.74, 0.27, 0.32),
      material: paint(color),
      position: [0, 0.2, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.62, 0.08, 0.33),
      material: glass(),
      position: [-0.03, 0.26, 0],
    },
    {
      geometry: new THREE.BoxGeometry(0.06, 0.12, 0.28),
      material: glass(),
      position: [0.35, 0.24, 0],
    },
    ...wheels(
      [
        [0.25, 0.16],
        [0.25, -0.16],
        [-0.25, 0.16],
        [-0.25, -0.16],
      ],
      0.07,
      0.06,
      0.07,
    ),
  ];
}

const PARTS: Record<VehicleId, (color: string) => Part[]> = {
  car: carParts,
  camper: camperParts,
  motorbike: motorbikeParts,
  bus: busParts,
};

export function createVehicleMesh(vehicleId: VehicleId, color: string) {
  const group = new THREE.Group();

  for (const part of PARTS[vehicleId](color)) {
    const mesh = new THREE.Mesh(part.geometry, part.material);

    mesh.position.set(...part.position);

    if (part.rotation) {
      mesh.rotation.set(...part.rotation);
    }

    mesh.castShadow = true;
    group.add(mesh);
  }

  return group;
}
