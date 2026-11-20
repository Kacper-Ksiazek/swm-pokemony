import type { TrafficCar } from "../../../../../../sensors.types";

export type StepTrafficPoolParams = {
  cars: TrafficCar[];
  dt: number;
  forwardRate: number;
  playerLane: number;
  nextRand: () => number;
};

export type StepOneTrafficCarParams = {
  car: TrafficCar;
  cars: TrafficCar[];
  dt: number;
  forwardRate: number;
  playerLane: number;
  nextRand: () => number;
};

export type StepOneTrafficCarResult = {
  car: TrafficCar;
  overtook: number;
};

export type RespawnTrafficCarParams = {
  car: TrafficCar;
  cars: TrafficCar[];
  playerLane: number;
  nextRand: () => number;
};
