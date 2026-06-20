import { GRID_SIZE } from "../store/useRoverStore";

const TURN_LEFT  = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT = { N: "E", E: "S", S: "W", W: "N" };

const DELTA = {
  N: { x: 0,  y: -1 },
  S: { x: 0,  y:  1 },
  E: { x: 1,  y:  0 },
  W: { x: -1, y:  0 },
};

export function applyTurn(heading, side) {
  return side === "L" ? TURN_LEFT[heading] : TURN_RIGHT[heading];
}

// Returns {newPos, blocked} for one step forward/backward
export function computeNextPos(pos, heading, direction) {
  const d = DELTA[heading];
  const mult = direction === "F" ? 1 : -1;
  const next = {
    x: pos.x + d.x * mult,
    y: pos.y + d.y * mult,
  };

  // Boundary check
  if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) {
    return { newPos: pos, blocked: true, reason: "boundary" };
  }

  return { newPos: next, blocked: false };
}

export function isObstacle(pos, obstacles) {
  return obstacles.some(o => o.x === pos.x && o.y === pos.y);
}